/* ====== CONFIG ====== */
const ACCESS_CODE = "ktv2026";          // mã truy cập chung. Để "" nếu KHÔNG cần mã.
const LOGO_URL    = "logo/v-logo.png";  // logo công ty (góc trái header). Để "" nếu chưa có.
const CONF_URL    = "logo/sign.png";    // con dấu CONFIDENTIAL (góc phải header). Để "" nếu không dùng.

/* logo on login */
if(LOGO_URL){ const lg=document.getElementById('lg-logo'); lg.src=LOGO_URL; lg.style.display='inline-block'; }

/* preload logo header để html2canvas chụp đủ ảnh (không bị thiếu logo lúc xuất) */
[LOGO_URL,CONF_URL].forEach(u=>{ if(u){ const i=new Image(); i.src=u; } });

const ROWS = [
  ["1","Thay linh kiện (Nếu có)","Đúng chủng loại, lắp đúng vị trí, cấu hình đúng yêu cầu.","Đạt","Chưa đạt"],
  ["2","Thu hồi linh kiện cũ (Nếu có)","Linh kiện cũ được thu hồi đúng đủ sau khi sửa chữa.","Có","Không"],
  ["3","Lắp ráp","Lắp lại đủ thành phần, đúng vị trí","Đạt","Chưa đạt"],
  ["4","Lắp ráp","Vít / bulong siết đủ lực, không toét","Đạt","Chưa đạt"],
  ["5","Lắp ráp","Kết cấu chắc chắn, không rung lắc","Đạt","Chưa đạt"],
  ["6","Màn hình lỗi","Trụ sạc / Tủ pin không còn hiển thị thông tin báo lỗi trên màn hình.","Đạt","Chưa đạt"],
  ["7","Chức năng","Khởi động / Reset OK","Đạt","Chưa đạt"],
  ["8","Chức năng","Kiểm tra sạc / đổi pin thành công","Đạt","Chưa đạt"],
  ["9","Chức năng","Sạc ổn định 10 phút không gián đoạn (Nếu có xe sạc)","Đạt","Chưa đạt"],
  ["10","An toàn","Không rò điện, không mùi khét","Đạt","Chưa đạt"],
  ["11","Sản phẩm","Trụ sạc, tủ đổi pin được vệ sinh sạch sẽ sau khi sửa chữa.","Đạt","Chưa đạt"],
  ["12","Hiện trường","Khu vực sửa chữa được dọn dẹp sạch sẽ sau sửa chữa.","Đạt","Chưa đạt"],
];

/* build interactive item cards */
const itemsEl=document.getElementById('items');
ROWS.forEach(r=>{
  const d=document.createElement('div'); d.className='item';
  d.innerHTML=
    `<div class="head"><span class="num">${r[0]}</span><span class="cat">${r[1]}</span></div>`+
    `<div class="desc">${r[2]}</div>`+
    `<div class="pills">`+
      `<span class="pill ok"><input type="radio" name="row${r[0]}" id="r${r[0]}a" value="ok"><label for="r${r[0]}a"><span class="dot"></span>${r[3]}</label></span>`+
      `<span class="pill bad"><input type="radio" name="row${r[0]}" id="r${r[0]}b" value="bad"><label for="r${r[0]}b"><span class="dot"></span>${r[4]}</label></span>`+
    `</div>`;
  itemsEl.appendChild(d);
});

/* default today */
(function(){const t=new Date(),p=n=>String(n).padStart(2,'0');
  document.getElementById('f_ngay').value=`${t.getFullYear()}-${p(t.getMonth()+1)}-${p(t.getDate())}`;})();

/* ===== SIGNATURE PADS ===== */
const sigs={};
function initSig(key){
  const c=document.getElementById('sig_'+key);
  const ctx=c.getContext('2d');
  const dpr=window.devicePixelRatio||1;
  const r=c.getBoundingClientRect();
  c.width=Math.max(1,Math.round(r.width*dpr));
  c.height=Math.max(1,Math.round(r.height*dpr));
  ctx.scale(dpr,dpr);
  ctx.lineWidth=2.4; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.strokeStyle='#13315c';
  let drawing=false,last=null,dirty=false;
  const hint=document.getElementById('hint_'+key);
  const pos=e=>{const b=c.getBoundingClientRect();
    const t=(e.touches&&e.touches[0])||(e.changedTouches&&e.changedTouches[0])||e;
    return {x:t.clientX-b.left,y:t.clientY-b.top};};
  const start=e=>{drawing=true;last=pos(e);if(hint)hint.style.display='none';
    if(e.pointerId!=null){try{c.setPointerCapture(e.pointerId);}catch(_){}} e.preventDefault();};
  const move=e=>{if(!drawing)return;const p=pos(e);
    ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();last=p;dirty=true;e.preventDefault();};
  const stop=e=>{drawing=false;};
  if(window.PointerEvent){
    c.addEventListener('pointerdown',start); c.addEventListener('pointermove',move);
    c.addEventListener('pointerup',stop); c.addEventListener('pointercancel',stop); c.addEventListener('pointerleave',stop);
  }else{
    c.addEventListener('touchstart',start,{passive:false}); c.addEventListener('touchmove',move,{passive:false});
    c.addEventListener('touchend',stop); c.addEventListener('touchcancel',stop);
    c.addEventListener('mousedown',start); c.addEventListener('mousemove',move); c.addEventListener('mouseup',stop);
  }
  sigs[key]={
    clear(){ctx.clearRect(0,0,c.width,c.height);dirty=false;if(hint)hint.style.display='';},
    isDirty(){return dirty;},
    data(){return dirty?c.toDataURL('image/png'):'';}
  };
}
/* app.js nằm cuối <body> + CSS đã nạp (link trong <head>) nên DOM & layout đã sẵn:
   khởi tạo chữ ký NGAY, không chờ window 'load'. */
initSig('ktv'); initSig('gs');
/* canvas đổi kích thước khi xoay ngang/dọc → khởi tạo lại để ký không lệch nét */
window.addEventListener('orientationchange',()=>{ setTimeout(()=>{ initSig('ktv'); initSig('gs'); },300); });
function clearSig(key){ if(sigs[key]) sigs[key].clear(); }

/* ===== LOGIN ===== */
function showApp(name){
  document.getElementById('login').style.display='none';
  document.getElementById('who-name').textContent=name||'';
  if(name){ if(!document.getElementById('f_ktv').value) document.getElementById('f_ktv').value=name;
            if(!document.getElementById('f_ktv_ky').value) document.getElementById('f_ktv_ky').value=name; }
}
function doLogin(){
  const name=document.getElementById('lg-name').value.trim();
  const code=document.getElementById('lg-code').value;
  const err=document.getElementById('lg-err');
  if(!name){err.textContent='Vui lòng nhập họ tên KTV.';return;}
  if(ACCESS_CODE && code!==ACCESS_CODE){err.textContent='Mã truy cập không đúng.';return;}
  err.textContent='';
  localStorage.setItem('ck_name',name); localStorage.setItem('ck_auth','1');
  showApp(name);
}
function logout(){ localStorage.removeItem('ck_auth');
  document.getElementById('login').style.display='flex';
  document.getElementById('lg-code').value=''; }

/* auto-resume on same device */
(function(){ if(localStorage.getItem('ck_auth')==='1'){
  const n=localStorage.getItem('ck_name')||''; document.getElementById('lg-name').value=n; showApp(n);
}else{ const n=localStorage.getItem('ck_name'); if(n) document.getElementById('lg-name').value=n; }})();
document.getElementById('lg-code').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});

/* ===== COLLECT + RENDER EXPORT ===== */
function val(id){return (document.getElementById(id).value||'').trim();}
function radio(name){const x=document.querySelector(`input[name="${name}"]:checked`);return x?x.value:'';}
function esc(s){return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function cb(on){return `<span class="ebox">${on?'✓':''}</span>`;}
function vline(t,extra){return `<span class="val${extra?' '+extra:''}">${esc(t)||'&nbsp;'}</span>`;}
function kyCell(key){ const d=sigs[key]&&sigs[key].data(); return d?`<img class="sig" src="${d}">`:vline(''); }

function renderExport(){
  const ht=radio('hinhthuc');
  let rowsHtml='';
  ROWS.forEach(r=>{
    const sel=radio('row'+r[0]);
    /* nhãn mặc định Đạt/Chưa đạt đã có ở tiêu đề cột → chỉ hiện ô tick;
       dòng có nhãn riêng (vd "Có"/"Không") thì in nhãn nhỏ dưới ô tick */
    const isDefault = r[3]==='Đạt' && r[4]==='Chưa đạt';
    const okCell  = isDefault ? cb(sel==='ok')  : `${cb(sel==='ok')}<div class="rl">${r[3]}</div>`;
    const badCell = isDefault ? cb(sel==='bad') : `${cb(sel==='bad')}<div class="rl">${r[4]}</div>`;
    rowsHtml+=`<tr><td class="stt">${r[0]}</td><td class="main">${r[1]}</td><td>${r[2]}</td>`+
      `<td class="res">${okCell}</td><td class="res">${badCell}</td></tr>`;
  });
  const kl=radio('ketluan');
  const mota=esc(val('f_mota'));
  document.getElementById('sheet').innerHTML=
    `<div class="ehead">`+
      `<div class="elogo-wrap">${LOGO_URL?`<img class="elogo" src="${LOGO_URL}">`:''}</div>`+
      `${CONF_URL?`<img class="econf-img" src="${CONF_URL}">`:`<div class="econf">CONFIDENTIAL</div>`}`+
    `</div>`+
    `<h1>CHECKLIST NGHIỆM THU SAU SỬA CHỮA</h1>`+
    `<div class="ssub">(Trụ sạc và Tủ đổi Pin)</div>`+
    `<div class="esec">I. THÔNG TIN</div>`+
    `<ul class="einfo">`+
      `<li><b>Mã trụ / trạm:</b>${vline(val('f_ma_tru'))}<b>Mã sự vụ:</b>${vline(val('f_ma_su_vu'))}</li>`+
      `<li><b>Địa điểm:</b>${vline(val('f_dia_diem'),'wide')}</li>`+
      `<li><b>Ngày sửa chữa:</b>${vline(val('f_ngay'))}</li>`+
      `<li><b>KTV thực hiện:</b>${vline(val('f_ktv'))}<b>NCC/ĐTUQ:</b>${vline(val('f_ncc'))}</li>`+
      `<li><b>Hình thức sửa chữa:</b> `+
        `${cb(ht==='Có thay linh kiện')}Có thay linh kiện&nbsp;&nbsp;`+
        `${cb(ht==='Không thay')}Không thay&nbsp;&nbsp;`+
        `${cb(ht==='Không sửa chữa')}Không sửa chữa</li>`+
    `</ul>`+
    `<div class="esec">II. KIỂM TRA KỸ THUẬT – NGHIỆM THU</div>`+
    `<table><thead><tr><th class="hstt">STT</th><th>Hạng mục chính</th><th>Hạng mục nhỏ</th><th class="hres">Đạt</th><th class="hres">Chưa đạt</th></tr></thead>`+
    `<tbody>${rowsHtml}</tbody></table>`+
    `<div class="elabel"><b>Mô tả khác:</b></div>`+
    `<div class="emota">${mota}</div>`+
    `<div class="esec">III. KẾT LUẬN &amp; XÁC NHẬN</div>`+
    `<ul class="einfo">`+
      `<li><b>Kết luận nghiệm thu:</b></li>`+
      `<li class="sub">${cb(kl==='dat')}Đạt&nbsp;&nbsp;&nbsp;${cb(kl==='khong')}Không đạt&nbsp;(Lý do:${vline(val('f_lydo'),'wide')})</li>`+
      `<li><b>KTV sửa chữa:</b>${vline(val('f_ktv_ky'))}<b>Ký:</b>${kyCell('ktv')}</li>`+
      `<li><b>Giám sát / nghiệm thu (nếu có):</b>${vline(val('f_gs'))}<b>Ký:</b>${kyCell('gs')}</li>`+
    `</ul>`;
}

function fileName(ext){
  const sv=val('f_ma_su_vu').replace(/[^\w-]+/g,'_');
  const dt=val('f_ngay');
  return `Checklist_${sv||'NghiemThu'}_${dt||''}`.replace(/_+$/,'')+'.'+ext;
}

/* ===== GENERATE IMAGE + RESULT OVERLAY ===== */
let genBlob=null, genName='', genType='image/png', genUrl='';

/* Trình duyệt nhúng trong app (Zalo, Messenger, Instagram, Line...) thường yếu →
   giảm scale để bớt treo khi xuất ảnh. Trình duyệt thường vẫn dùng scale 2 cho nét. */
function isInApp(){ return /Zalo|FBAN|FBAV|FB_IAB|Instagram|Line\/|MicroMessenger/i.test(navigator.userAgent); }
const EXPORT_SCALE = isInApp() ? 1.5 : 2;

function showLoading(on){
  const el=document.getElementById('loading'); if(el) el.style.display=on?'flex':'none';
}

async function makeImage(type){
  if(typeof html2canvas==='undefined'){ alert('Thư viện tạo ảnh đang tải, vui lòng thử lại sau giây lát.'); return; }
  showLoading(true);
  try{
    renderExport();
    // nhường 1 nhịp để spinner kịp vẽ trước khi html2canvas chiếm CPU
    await new Promise(r=>setTimeout(r,40));
    const canvas=await html2canvas(document.getElementById('sheet'),
      {scale:EXPORT_SCALE,backgroundColor:'#ffffff',width:780,windowWidth:780,useCORS:true});
    genType = type==='png'?'image/png':'image/jpeg';
    genName = fileName(type==='png'?'png':'jpg');
    /* CHỈ mã hoá MỘT lần bằng toBlob, rồi dùng object URL cho ảnh xem trước.
       (Trước đây gọi cả toDataURL + toBlob = mã hoá 2 lần → nặng, treo trên Zalo.) */
    genBlob = await new Promise(res=>canvas.toBlob(b=>res(b), genType, type==='png'?1:0.92));
    if(!genBlob){ alert('Không tạo được ảnh trên trình duyệt này. Hãy thử “Mở bằng trình duyệt”.'); return; }
    if(genUrl){ URL.revokeObjectURL(genUrl); }
    genUrl = URL.createObjectURL(genBlob);
    document.getElementById('rimg').src=genUrl;
    document.getElementById('result').style.display='flex';
    window.scrollTo(0,0);
  }catch(err){ alert('Không tạo được ảnh: '+err); }
  finally{ showLoading(false); }
}
/* ===== device helpers ===== */
function isMobile(){
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent)
    || (navigator.maxTouchPoints>1 && /Macintosh/.test(navigator.userAgent)); /* iPad iPadOS */
}
function isIOS(){
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
    || (navigator.maxTouchPoints>1 && /Macintosh/.test(navigator.userAgent)); /* iPad iPadOS */
}
function canShareFiles(file){
  try{ return !!(navigator.canShare && navigator.canShare({files:[file]})); }catch(e){ return false; }
}
/* Mở bảng chia sẻ để "Lưu ảnh". Trả về true nếu đã mở được (kể cả khi user huỷ). */
async function shareFile(){
  if(!genBlob || !navigator.share) return false;
  const file=new File([genBlob], genName, {type:genType});
  if(!canShareFiles(file)) return false;
  try{ await navigator.share({files:[file], title:genName}); return true; }
  catch(e){ return !!(e && e.name==='AbortError'); /* user huỷ → coi như đã xử lý */ }
}
/* đánh dấu thiết bị di động để CSS hiện gợi ý "nhấn giữ ảnh" */
if(isMobile()) document.documentElement.classList.add('is-mobile');

/* Tải thẳng bằng thẻ <a download> – dùng cho PC & nhiều trình duyệt Android.
   KHÔNG dùng target="_blank" vì trên di động nó chỉ mở tab trống, không lưu được. */
function tryDownload(){
  if(!genBlob) return false;
  try{
    const url=URL.createObjectURL(genBlob);
    const a=document.createElement('a');
    a.href=url; a.download=genName; a.rel='noopener';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),10000);
    return true;
  }catch(e){ return false; }
}
function showSaveHint(){
  const el=document.getElementById('rhint-save');
  if(el){ el.style.display='block'; try{ el.scrollIntoView({block:'nearest'}); }catch(_){} }
}

/* Nút "Tải về" – xử lý theo từng nền tảng vì khả năng tải mỗi nơi mỗi khác:
   - PC / Android (trình duyệt thật): <a download> tải thẳng được → KHÔNG bật chia sẻ.
   - iOS Safari: CHẶN <a download> → chỉ có share sheet ("Lưu ảnh") hoặc nhấn-giữ ảnh.
   - Webview trong app (Zalo, Messenger…): CHẶN <a download> và thường không có Web Share
     → cách chắc ăn duy nhất là nhấn-giữ ảnh → hiện hướng dẫn rõ ràng. */
async function downloadGenerated(){
  if(!genBlob){ return; }

  /* PC / laptop: tải thẳng */
  if(!isMobile()){
    if(!tryDownload()) showSaveHint();
    return;
  }

  /* Trình duyệt trong app (Zalo…): thử chia sẻ nếu bản mới hỗ trợ, không thì hướng dẫn nhấn-giữ */
  if(isInApp()){
    if(await shareFile()) return;
    showSaveHint();
    return;
  }

  /* Android trình duyệt thật: ưu tiên tải thẳng (không bật share sheet cho đỡ giống "chia sẻ") */
  if(!isIOS()){
    if(tryDownload()) return;
    if(await shareFile()) return;
    showSaveHint();
    return;
  }

  /* iOS Safari: không tải thẳng được → share sheet ("Lưu ảnh"), không thì nhấn-giữ ảnh */
  if(await shareFile()) return;
  showSaveHint();
}
function closeResult(){ document.getElementById('result').style.display='none'; }

function clearAll(){
  if(!confirm('Xóa toàn bộ nội dung đã nhập?')) return;
  document.querySelectorAll('.app input[type=text],.app input:not([type]),.app input[type=date],.app textarea')
    .forEach(i=>{ if(i.id!=='f_ktv'&&i.id!=='f_ktv_ky') i.value=''; });
  document.querySelectorAll('.app input[type=radio]').forEach(i=>i.checked=false);
  document.getElementById('f_mota').value='';
  clearSig('ktv'); clearSig('gs');
}
