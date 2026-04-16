const API = "https://script.google.com/macros/s/AKfycbwUPdb_0y7zZHmva1eUriHijFaBwLlFoU8Ye-OU8kYAHsA7NkdQiCz5vYX6a9YuVv4W/exec";

let globalData = [];

// ================= LOAD DATA =================
async function loadData() {
  try {
    const res = await fetch(API);
    const data = await res.json();

    globalData = data;
    data.sort((a,b)=> a.nama.localeCompare(b.nama));

    renderTable(data);
    updateStats(data);

  } catch (err) {
    console.error("ERROR LOAD:", err);
  }
}

// ================= RENDER TABLE =================
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
          ${user.status === "Aktif" ? "Aktif" : "Belum"}
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

// ================= STATS =================
function updateStats(data){
  document.getElementById("total").innerText = data.length;
  document.getElementById("aktif").innerText =
    data.filter(x=>x.status==="Aktif").length;
  document.getElementById("suspend").innerText =
    data.filter(x=>x.status==="Suspend").length;
}

// ================= AKSI (FIX FINAL) =================
function aksi(action,nama){
  const ok = confirm(`Yakin ubah status ${nama}?`);
  if (!ok) return;

  // 🔥 UPDATE UI LANGSUNG
  globalData = globalData.map(x => {
    if (x.nama === nama) {
      return {
        ...x,
        status: action === "aktif" ? "Aktif" : "Suspend"
      };
    }
    return x;
  });

  renderTable(globalData);
  updateStats(globalData);

  // 🔄 KIRIM KE GAS
  fetch(API + `?action=${action}&nama=${encodeURIComponent(nama)}`)
    .then(() => {
      // 🔥 DELAY biar GAS selesai update
      setTimeout(() => {
        loadData();
      }, 2000);
    })
    .catch(err => {
      console.error("Gagal update:", err);
    });
}

// ================= SYNC =================
function syncMikrotik(){
  alert("Sync Mikrotik jalan...");
  fetch(API + "?action=sync")
    .then(() => {
      setTimeout(() => {
        loadData();
      }, 2000);
    })
    .catch(err => console.error(err));
}

// ================= SEARCH =================
document.getElementById("search").addEventListener("input", e=>{
  const val = e.target.value.toLowerCase();
  const filtered = globalData.filter(x =>
    x.nama.toLowerCase().includes(val)
  );
  renderTable(filtered);
});

// ================= INIT =================
loadData();
