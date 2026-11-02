<?php
require __DIR__.'/config.php';
header('X-Content-Type-Options: nosniff');
$action = $_GET['action'] ?? $_POST['action'] ?? '';

if ($action === 'start') {
    $name = trim($_POST['name'] ?? ''); $class = trim($_POST['class_name'] ?? ''); $studentCode = trim($_POST['student_code'] ?? '');
    if ($name === '' || $class === '') json_out(['ok'=>false,'message'=>'Vui lòng nhập họ tên và lớp.'],422);
    $bank = questions_bank();
    if (count($bank) < 50) json_out(['ok'=>false,'message'=>'Ngân hàng hiện có dưới 50 câu.'],500);
    shuffle($bank); $selected = array_slice($bank,0,50); $quiz = [];
    foreach ($selected as $q) {
        $opts=[]; foreach ($q['options'] as $letter=>$value) $opts[]=['value'=>$value];
        shuffle($opts); $display=[]; $correctLetter='';
        foreach ($opts as $i=>$o) { $letter=chr(65+$i); $display[$letter]=$o['value']; if ($o['value']===$q['options'][$q['answer']]) $correctLetter=$letter; }
        $quiz[]=['id'=>$q['id'],'question'=>$q['question'],'options'=>$display,'correct'=>$correctLetter,'chosen'=>null];
    }
    $_SESSION['active_quiz']=['student'=>['name'=>$name,'class_name'=>$class,'student_code'=>$studentCode],'questions'=>$quiz,'started_at'=>date('Y-m-d H:i:s')];
    $public=[]; foreach($quiz as $i=>$q) $public[]=['id'=>$q['id'],'question'=>$q['question'],'options'=>$q['options']];
    json_out(['ok'=>true,'questions'=>$public,'count'=>50]);
}

if ($action === 'submit') {
    if (empty($_SESSION['active_quiz'])) json_out(['ok'=>false,'message'=>'Không tìm thấy bài thi. Vui lòng tải lại trang và bắt đầu lại.'],400);
    $input=json_decode(file_get_contents('php://input'),true) ?: []; $answers=$input['answers'] ?? [];
    $quiz=$_SESSION['active_quiz']; $correct=0; $detail=[];
    foreach($quiz['questions'] as $i=>$q) {
        $chosen=$answers[(string)$i] ?? null; $isCorrect=($chosen !== null && $chosen === $q['correct']);
        if($isCorrect) $correct++;
        $detail[]=['question_id'=>$q['id'],'question'=>$q['question'],'selected'=>$chosen,'selected_text'=>($chosen && isset($q['options'][$chosen]))?$q['options'][$chosen]:'Chưa trả lời','correct_letter'=>$q['correct'],'correct_text'=>$q['options'][$q['correct']],'is_correct'=>$isCorrect];
    }
    $score=round($correct/50*10,2); $duration=max(0,time()-strtotime($quiz['started_at']));
    try {
        $stmt=db()->prepare('INSERT INTO results(student_name,student_code,class_name,correct_count,total_questions,score,duration_seconds,started_at,submitted_at,details_json) VALUES(?,?,?,?,?,?,?,?,NOW(),?)');
        $stmt->execute([$quiz['student']['name'],$quiz['student']['student_code'],$quiz['student']['class_name'],$correct,50,$score,$duration,$quiz['started_at'],json_encode($detail,JSON_UNESCAPED_UNICODE)]);
        $resultId=(int)db()->lastInsertId();
    } catch(Throwable $e) { json_out(['ok'=>false,'message'=>'Không lưu được kết quả. Kiểm tra cấu hình cơ sở dữ liệu.'],500); }
    unset($_SESSION['active_quiz']);
    json_out(['ok'=>true,'result_id'=>$resultId,'correct'=>$correct,'wrong'=>50-$correct,'score'=>number_format($score,2),'duration'=>$duration]);
}

if ($action === 'teacher_login') {
    $username=trim($_POST['username']??''); $password=$_POST['password']??'';
    $stmt=db()->prepare('SELECT id,username,password_hash FROM teachers WHERE username=? LIMIT 1'); $stmt->execute([$username]); $teacher=$stmt->fetch();
    if(!$teacher || !password_verify($password,$teacher['password_hash'])) json_out(['ok'=>false,'message'=>'Tên đăng nhập hoặc mật khẩu không đúng.'],401);
    session_regenerate_id(true); $_SESSION['teacher_id']=$teacher['id']; $_SESSION['teacher_name']=$teacher['username'];
    json_out(['ok'=>true]);
}
if ($action === 'teacher_logout') { unset($_SESSION['teacher_id'],$_SESSION['teacher_name']); json_out(['ok'=>true]); }
if ($action === 'teacher_results') {
    if(empty($_SESSION['teacher_id'])) json_out(['ok'=>false,'message'=>'Chưa đăng nhập.'],401);
    $class=trim($_GET['class_name']??''); $sql='SELECT id,student_name,student_code,class_name,correct_count,total_questions,score,duration_seconds,submitted_at FROM results'; $args=[];
    if($class!==''){ $sql.=' WHERE class_name=?'; $args[]=$class; } $sql.=' ORDER BY submitted_at DESC';
    $st=db()->prepare($sql);$st->execute($args);$rows=$st->fetchAll();
    $classes=db()->query('SELECT DISTINCT class_name FROM results ORDER BY class_name')->fetchAll(PDO::FETCH_COLUMN);
    $stats=db()->query('SELECT COUNT(*) total,ROUND(AVG(score),2) average,MAX(score) highest,MIN(score) lowest FROM results')->fetch();
    json_out(['ok'=>true,'rows'=>$rows,'classes'=>$classes,'stats'=>$stats]);
}
if ($action === 'teacher_detail') {
    if(empty($_SESSION['teacher_id'])) json_out(['ok'=>false,'message'=>'Chưa đăng nhập.'],401);
    $st=db()->prepare('SELECT * FROM results WHERE id=?');$st->execute([(int)($_GET['id']??0)]);$r=$st->fetch();
    if(!$r) json_out(['ok'=>false,'message'=>'Không tìm thấy bài làm.'],404);
    $r['details']=json_decode($r['details_json'],true); unset($r['details_json']); json_out(['ok'=>true,'result'=>$r]);
}
if ($action === 'export') {
    if(empty($_SESSION['teacher_id'])) { http_response_code(401); exit('Unauthorized'); }
    $class=trim($_GET['class_name']??'');$sql='SELECT student_name,student_code,class_name,correct_count,total_questions,score,duration_seconds,submitted_at FROM results';$args=[];
    if($class!==''){$sql.=' WHERE class_name=?';$args[]=$class;}$sql.=' ORDER BY submitted_at DESC';$st=db()->prepare($sql);$st->execute($args);
    header('Content-Type: text/csv; charset=utf-8');header('Content-Disposition: attachment; filename="bang-diem-php-mysql.csv"');
    $fp=fopen('php://output','w');fwrite($fp,"\xEF\xBB\xBF");fputcsv($fp,['Họ tên','Mã học sinh','Lớp','Số câu đúng','Tổng câu','Điểm','Thời gian (giây)','Thời điểm nộp']);
    while($row=$st->fetch(PDO::FETCH_NUM)) fputcsv($fp,$row);fclose($fp);exit;
}
json_out(['ok'=>false,'message'=>'Yêu cầu không hợp lệ.'],404);
