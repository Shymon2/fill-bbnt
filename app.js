/* ====== CONFIG ====== */
const ACCESS_CODE = "ktv2026";   // mã truy cập chung. Để "" nếu KHÔNG cần mã.
const LOGO_URL    = "";          // logo công ty: dán data-URL ("data:image/png;base64,....") hoặc link https. Để "" nếu chưa có.

/* ====== Telegram Mini App (TÙY CHỌN) ======
   Script telegram-web-app.js được tải ASYNC để KHÔNG chặn hiển thị trang
   (trên Zalo/mạng VN, telegram.org có thể chậm → trước đây gây lag lúc mở).
   Vì vậy không lấy đối tượng TG ngay lúc này mà đọc lười qua hàm tg(). */
function tg(){ return (window.Telegram && window.Telegram.WebApp) ? window.Telegram.WebApp : null; }

/* logo on login */
if(LOGO_URL){ const lg=document.getElementById('lg-logo'); lg.src=LOGO_URL; lg.style.display='inline-block'; }

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
   khởi tạo chữ ký NGAY, không chờ window 'load' (tránh bị treo nếu Telegram tải chậm). */
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

/* Khởi tạo Telegram khi script đã sẵn sàng (tải async) – không chặn giao diện.
   Thử ngay; nếu chưa có thì thử lại lúc 'load' (lúc đó script async đã nạp xong). */
function initTelegram(){
  const t=tg(); if(!t) return;
  try{ t.ready(); t.expand();
    if(t.setHeaderColor) t.setHeaderColor('#0b5fa5');
    if(t.disableVerticalSwipes) t.disableVerticalSwipes(); }catch(e){}
  try{ if(t.initDataUnsafe && t.initDataUnsafe.user){
    const u=t.initDataUnsafe.user;
    const nm=[u.last_name,u.first_name].filter(Boolean).join(' ').trim();
    if(nm && !localStorage.getItem('ck_name')){
      localStorage.setItem('ck_name',nm);
      const f=document.getElementById('lg-name'); if(f && !f.value) f.value=nm;
    }
  } }catch(e){}
}
initTelegram();
if(!tg()) window.addEventListener('load', initTelegram);
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
function vline(t){return `<span class="val">${esc(t)||'&nbsp;'}</span>`;}
function kyCell(key){ const d=sigs[key]&&sigs[key].data(); return d?`<img class="sig" src="${d}">`:vline(''); }

function renderExport(){
  const ht=radio('hinhthuc');
  let rowsHtml='';
  ROWS.forEach(r=>{
    const sel=radio('row'+r[0]);
    rowsHtml+=`<tr><td class="stt">${r[0]}</td><td class="main">${r[1]}</td><td>${r[2]}</td>`+
      `<td class="res"><span class="rh k">${r[3]}</span>${cb(sel==='ok')}</td>`+
      `<td class="res"><span class="rh x">${r[4]}</span>${cb(sel==='bad')}</td></tr>`;
  });
  const kl=radio('ketluan');
  document.getElementById('sheet').innerHTML=
    (LOGO_URL?`<img class="elogo" src="${LOGO_URL}">`:'')+
    `<h1>CHECKLIST NGHIỆM THU SAU SỬA CHỮA</h1>`+
    `<div class="ssub">(Trụ sạc và Tủ đổi Pin)</div>`+
    `<div class="esec">I. THÔNG TIN</div>`+
    `<div class="eline"><b>Mã trụ / trạm:</b>${vline(val('f_ma_tru'))}<b>Mã sự vụ:</b>${vline(val('f_ma_su_vu'))}</div>`+
    `<div class="eline"><b>Địa điểm:</b>${vline(val('f_dia_diem'))}</div>`+
    `<div class="eline"><b>Ngày sửa chữa:</b>${vline(val('f_ngay'))}<b>KTV thực hiện:</b>${vline(val('f_ktv'))}<b>NCC/ĐTUQ:</b>${vline(val('f_ncc'))}</div>`+
    `<div class="eline"><b>Hình thức sửa chữa:</b>`+
      `${cb(ht==='Có thay linh kiện')}Có thay linh kiện&nbsp;&nbsp;`+
      `${cb(ht==='Không thay')}Không thay&nbsp;&nbsp;`+
      `${cb(ht==='Không sửa chữa')}Không sửa chữa</div>`+
    `<div class="esec">II. KIỂM TRA KỸ THUẬT – NGHIỆM THU</div>`+
    `<table><thead><tr><th>STT</th><th>Hạng mục chính</th><th>Hạng mục nhỏ</th><th>Đạt</th><th>Chưa đạt</th></tr></thead>`+
    `<tbody>${rowsHtml}</tbody></table>`+
    `<div class="eline" style="margin-top:10px"><b>Mô tả khác:</b></div>`+
    `<div class="enote">${esc(val('f_mota'))}</div>`+
    `<div class="esec">III. KẾT LUẬN &amp; XÁC NHẬN</div>`+
    `<div class="eline"><b>Kết luận nghiệm thu:</b>${cb(kl==='dat')}Đạt&nbsp;&nbsp;${cb(kl==='khong')}Không đạt`+
      `&nbsp;&nbsp;<b>Lý do:</b>${vline(val('f_lydo'))}</div>`+
    `<div class="eline"><b>KTV sửa chữa:</b>${vline(val('f_ktv_ky'))}<b>Ký:</b>${kyCell('ktv')}</div>`+
    `<div class="eline"><b>Giám sát / nghiệm thu (nếu có):</b>${vline(val('f_gs'))}<b>Ký:</b>${kyCell('gs')}</div>`+
    `<div class="efoot"><b>Lưu ý:</b> Tải đầy đủ hình ảnh lên hệ thống VOMS kèm tọa độ và thời gian: `+
      `tổng thể trụ/trạm trước &amp; sau sửa chữa, màn hình lỗi trước &amp; sau (nếu có), linh kiện cũ và mới `+
      `(rõ SN nếu có), vị trí đã sửa hoàn thiện, ảnh/video test sạc-đổi pin (nếu có), và ảnh checklist này.</div>`;
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
function canShareFiles(file){
  try{ return !!(navigator.canShare && navigator.canShare({files:[file]})); }catch(e){ return false; }
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

/* Nút "Tải về": PC tải thẳng; điện thoại mở share sheet để "Lưu ảnh" về thư viện.
   Lưu ý: iOS Safari & WebView trong app CHẶN <a download> → phải share sheet hoặc nhấn-giữ ảnh. */
async function downloadGenerated(){
  if(!genBlob){ return; }
  if(isMobile()){
    const file=new File([genBlob], genName, {type:genType});
    if(navigator.share && canShareFiles(file)){
      try{ await navigator.share({files:[file], title:genName}); return; }
      catch(e){ if(e && e.name==='AbortError') return; }
    }
    // Không có Web Share (Zalo/Safari cũ) → thử tải; nếu vẫn không thì mở ảnh ra tab mới để nhấn-giữ lưu
    if(tryDownload()){ showSaveHint(); return; }
    try{ if(genUrl) window.open(genUrl,'_blank'); }catch(e){}
    showSaveHint();
    return;
  }
  if(!tryDownload()) showSaveHint();
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
