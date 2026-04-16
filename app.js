const API = "https://script.googleusercontent.com/macros/echo?user_content_key=AWDtjMVq-QQDNGY-sqT6T7maF6gq5xb6AStvuIftyqwjG8U017tE-ze0WzhzkeWawvIWFIytlOMM41i5ZNLmOzNaGIC4Kgab53zFMHt8mIlUKx_tsIAQgBocLCZQFqHMLRx95os8mYdu4GcPDy9exIQtzH1mDUqbfGfWlMvUKPrS8z8XZyZBZeaUWe_fi3SON35pA5_XTNCYBDqfjhXLpA8FK1N_r3zjRXKjLKR6RSJdeV2f_vxoV13JuTDwiUNoOFV_9VGPanPpsRdACdpvtrcOca0_MBReSA&lib=MFKLzNPqymwmv1-tuPseZtgoUxcDVH0Jx";

let globalData = [];
let lastDataJSON = "";

async function loadData() {
  const res = await fetch(API);
  const data = await res.json();

  const newJSON = JSON.stringify(data);

  // ❌ kalau data sama → jangan render ulang
  if (newJSON === lastDataJSON && globalData.length > 0) {
  return;
}

  // ✔ kalau beda → update UI
  lastDataJSON = newJSON;

  globalData = data;
  data.sort((a,b)=> a.nama.localeCompare(b.nama));

  renderTable(data);
  updateStats(data);

  const loading = document.getElementById("loading");
if (loading) loading.style.display = "none";
}

function renderTable(data) {
  const tbody = document.getElementById("table-body");
  tbody.innerHTML = "";

  data.forEach(user => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${user.nama}</td>
      <td>${user.ip}</td>
      <td>
        <span class="status ${user.status === 'Aktif' ? 'active':'suspend'}">
          ${user.status}
        </span>
      </td>
      <td>
        <button class="btn-on" onclick="aksi('aktif','${user.nama}')">BAYAR</button>
        <button class="btn-off" onclick="aksi('suspend','${user.nama}')">BELUM</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

function updateStats(data){
  document.getElementById("total").innerText = data.length;
  document.getElementById("aktif").innerText =
    data.filter(x=>x.status==="Aktif").length;
  document.getElementById("suspend").innerText =
    data.filter(x=>x.status==="Suspend").length;
}

function aksi(action,nama){
  const ok = confirm(`Yakin ubah status ${nama}?`);
  if (!ok) return;

  fetch(API+`?action=${action}&nama=${nama}`)
    .then(()=>loadData());
}

// 🔥 tombol global
function syncMikrotik(){
  alert("Sync Mikrotik jalan...");
  fetch(API+"?action=sync")
    .then(()=>loadData());
}

function updateGithub(){
  alert("Push GitHub jalan...");
  fetch(API+"?action=push")
    .then(()=>loadData());
}

document.getElementById("search").addEventListener("input", e=>{
  const val = e.target.value.toLowerCase();
  const filtered = globalData.filter(x =>
    x.nama.toLowerCase().includes(val)
  );
  renderTable(filtered);
});

setInterval(loadData, 60000);
loadData();
