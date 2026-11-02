const $ = s => document.querySelector(s);
const STORAGE_KEY = 'phpQuizResultsV1';
let bank = [], questions = [], answers = {}, current = 0, student = {}, startedAt = 0, finalResult = null;

function shuffle(list) { const a = [...list]; for (let i=a.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function getResults() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; } }
function saveResult(result) { const all=getResults(); all.push(result); localStorage.setItem(STORAGE_KEY, JSON.stringify(all)); }
function formatTime(sec) { return String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0'); }
function escapeHtml(v) { return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

async function loadBank() {
  // Resolve the JSON relative to the current page so GitHub Pages project URLs work.
  const dataUrl = new URL('./questions.json', window.location.href);
  let response;
  try {
    response = await fetch(dataUrl.href, { cache: 'no-store' });
  } catch (err) {
    throw new Error(
      'Trình duyệt không tải được ngân hàng câu hỏi (questions.json).\n' +
      'Đường dẫn đang thử: ' + dataUrl.href + '\n' +
      'Hãy kiểm tra file questions.json đã được tải lên cùng cấp với index.html, ' +
      'GitHub Pages đã Deploy thành công và bạn đang mở website bằng https:// (không mở file trực tiếp trên máy).'
    );
  }
  if (!response.ok) {
    throw new Error(
      'Không tìm thấy hoặc không đọc được questions.json (HTTP ' + response.status + ').\n' +
      'Đường dẫn đang thử: ' + dataUrl.href + '\n' +
      'Hãy đặt questions.json cùng cấp với index.html, kiểm tra đúng chữ hoa/chữ thường và chờ GitHub Pages triển khai xong.'
    );
  }
  try {
    bank = await response.json();
  } catch (err) {
    throw new Error('File questions.json không phải JSON hợp lệ. Hãy tải lại file gốc trong gói website.');
  }
  if (!Array.isArray(bank) || bank.length !== 220) {
    throw new Error('Ngân hàng câu hỏi không đúng định dạng hoặc không đủ 220 câu (hiện có ' + (Array.isArray(bank) ? bank.length : 0) + ').');
  }
  for (const [i, q] of bank.entries()) {
    if (!q || !q.question || !q.options || !['A','B','C','D'].every(k => typeof q.options[k] === 'string') || !['A','B','C','D'].includes(q.answer)) {
      throw new Error('Dữ liệu câu hỏi số ' + (i + 1) + ' bị thiếu hoặc sai định dạng. Hãy tải lại questions.json gốc.');
    }
  }
}
$('#startForm').addEventListener('submit', async e => {
  e.preventDefault(); $('#startError').textContent='';
  const btn=e.submitter; btn.disabled=true; btn.textContent='Đang tải câu hỏi...';
  try {
    if (!bank.length) await loadBank();
    const fd=new FormData(e.target);
    student={name:String(fd.get('name')).trim(),class_name:String(fd.get('class_name')).trim(),student_code:String(fd.get('student_code')||'').trim()};
    if (!student.name || !student.class_name) throw new Error('Vui lòng nhập họ tên và lớp.');
    questions=shuffle(bank).slice(0,50).map(q=>{
      const correctText=q.options[q.answer];
      const opts=shuffle(Object.entries(q.options).map(([oldKey,text])=>({text,isCorrect:oldKey===q.answer})));
      return {id:q.id,question:q.question,options:opts,correctText};
    });
    answers={}; current=0; startedAt=Date.now();
    $('#studentLabel').textContent=`${student.name} · Lớp ${student.class_name}`;
    $('#intro').classList.add('hidden'); $('#student-form').classList.add('hidden'); $('#result').classList.add('hidden'); $('#review').classList.add('hidden'); $('#quiz').classList.remove('hidden');
    renderQuestion();
  } catch(err) { $('#startError').textContent=err.message; btn.disabled=false; btn.innerHTML='Bắt đầu làm bài <b>→</b>'; }
});
function renderQuestion() {
  const q=questions[current], area=$('#questionArea'); area.innerHTML='';
  const title=document.createElement('div'); title.className='question-title';
  title.innerHTML=`<span class="q-tag">CÂU ${current+1}</span><h3></h3>`; title.querySelector('h3').textContent=q.question; area.append(title);
  const list=document.createElement('div'); list.className='answer-list';
  q.options.forEach((opt,i)=>{const key=String(i);const label=document.createElement('label');label.className='answer-option'+(answers[current]===key?' selected':'');const radio=document.createElement('input');radio.type='radio';radio.name='answer';radio.checked=answers[current]===key;const badge=document.createElement('span');badge.className='option-letter';badge.textContent=String.fromCharCode(65+i);const text=document.createElement('span');text.className='option-text';text.textContent=opt.text;label.append(radio,badge,text);label.addEventListener('click',()=>{answers[current]=key;renderQuestion();});list.append(label);});
  area.append(list); const count=Object.keys(answers).length; $('#answeredCount').textContent=count; $('#progressBar').style.width=(count/50*100)+'%'; $('#questionPosition').textContent=`Câu ${current+1} / 50`; $('#prevBtn').disabled=current===0; $('#nextBtn').textContent=current===49?'Đến đầu bài ↑':'Câu tiếp theo →'; renderNav();
}
function renderNav(){const nav=$('#questionNav');nav.innerHTML='';questions.forEach((q,i)=>{const b=document.createElement('button');b.type='button';b.textContent=i+1;b.className='nav-dot'+(i===current?' active':'')+(answers[i]!==undefined?' done':'');b.addEventListener('click',()=>{current=i;renderQuestion();});nav.append(b);});}
$('#prevBtn').addEventListener('click',()=>{if(current>0){current--;renderQuestion();}});
$('#nextBtn').addEventListener('click',()=>{current=current===49?0:current+1;renderQuestion();});
$('#submitBtn').addEventListener('click',()=>{
  const unanswered=50-Object.keys(answers).length;
  if(unanswered>0&&!confirm(`Bạn còn ${unanswered} câu chưa trả lời. Vẫn nộp bài?`))return;
  if(!confirm('Xác nhận nộp bài? Sau khi nộp sẽ không thể chỉnh sửa.'))return;
  const correct=questions.reduce((n,q,i)=>n+(answers[i]!==undefined&&q.options[Number(answers[i])]?.isCorrect?1:0),0);
  const duration=Math.max(0,Math.floor((Date.now()-startedAt)/1000));
  finalResult={id:`${Date.now()}-${Math.random().toString(16).slice(2)}`,student_name:student.name,class_name:student.class_name,student_code:student.student_code,correct_count:correct,total_questions:50,score:(correct/50*10).toFixed(2),duration,submitted_at:new Date().toISOString(),details:questions.map((q,i)=>({question_id:q.id,question:q.question,options:q.options.map(o=>o.text),selected_index:answers[i]===undefined?null:Number(answers[i]),selected_text:answers[i]===undefined?'Bỏ trống':q.options[Number(answers[i])].text,correct_text:q.correctText,is_correct:answers[i]!==undefined&&q.options[Number(answers[i])].isCorrect}))};
  try{saveResult(finalResult);}catch(e){alert('Không thể lưu kết quả trên trình duyệt. Có thể bộ nhớ đã đầy hoặc chế độ riêng tư đang chặn lưu trữ. Hãy xuất/ghi lại kết quả trước khi đóng trang.');}
  showResult();
});
function showResult(){ $('#quiz').classList.add('hidden');$('#review').classList.add('hidden');$('#result').classList.remove('hidden');$('#scoreBig').innerHTML=`${finalResult.score} <small>/ 10</small>`;$('#correctNum').textContent=finalResult.correct_count;$('#wrongNum').textContent=50-finalResult.correct_count;$('#durationText').textContent=formatTime(finalResult.duration);$('#resultNote').textContent=`${student.name} · Lớp ${student.class_name} · Kết quả đã lưu trên trình duyệt này.`; }
$('#reviewBtn').addEventListener('click',()=>{renderReview();$('#result').classList.add('hidden');$('#review').classList.remove('hidden');});
$('#backResultBtn').addEventListener('click',()=>{$('#review').classList.add('hidden');$('#result').classList.remove('hidden');});
function renderReview(){const root=$('#reviewList');root.innerHTML='';$('#reviewSummary').textContent=`${student.name} · ${finalResult.correct_count}/50 câu đúng · ${finalResult.score}/10 điểm`;
 finalResult.details.forEach((q,i)=>{const article=document.createElement('article');article.className='detail-question';const head=document.createElement('div');head.className='detail-qhead';head.innerHTML=`<b>Câu ${i+1} · Mã câu ${q.question_id}</b><span class="${q.is_correct?'good':'bad'}">${q.is_correct?'Đúng':q.selected_index===null?'Bỏ trống':'Sai'}</span>`;const p=document.createElement('p');p.textContent=q.question;article.append(head,p);q.options.forEach((opt,j)=>{const row=document.createElement('div');row.className='review-option'+(opt===q.correct_text?' review-correct':'')+(j===q.selected_index&&!q.is_correct?' review-wrong':'');row.textContent=`${String.fromCharCode(65+j)}. ${opt}${j===q.selected_index?' — Bạn chọn':''}${opt===q.correct_text?' — Đáp án đúng':''}`;article.append(row);});root.append(article);});
}
$('#newTestBtn').addEventListener('click',()=>location.reload());
