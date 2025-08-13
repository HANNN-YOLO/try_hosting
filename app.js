// Ganti sesuai Supabase project kamu
const SUPABASE_URL = "https://lhwicvwatoiafbtgludo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxod2ljdndhdG9pYWZidGdsdWRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNDE0ODQsImV4cCI6MjA3MDYxNzQ4NH0.GAch-_FHbEC7njaMlJizSP0fC_bQLFGooKagxo27N0w";
const BUCKET = "test_crud_test1";

// Supabase client untuk upload file
const { createClient } = window.supabase;
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const dataList = document.getElementById("dataList");
const addForm = document.getElementById("addForm");

// Create data
addForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nama = document.getElementById("nama").value;
  const umur = parseInt(document.getElementById("umur").value);
  const file = document.getElementById("gambar").files[0];
  const filePath = `${Date.now()}_${file.name}`;

  // Upload file ke storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file);

  if (uploadError) {
    alert("Upload gagal!");
    console.error(uploadError);
    return;
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(filePath);

  // Simpan metadata ke tabel versi lama
  // const { error: insertError } = await supabase
  //   .from("test_crud")
  //   .insert([{ nama, umur, gambar_profile: publicUrlData.publicUrl, created_at: new Date() }]);

//   // Simpan metadata ke tabel versi lama sambungan dari line 35
//   if (insertError) {
//     alert("Gagal menyimpan data!");
//     console.error(insertError);
//   } else {
//     addForm.reset();
//   }
// });
// Simpan metadata ke tabel versi baru
      await fetch("/api/insert", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    nama,
    umur,
    gambar_profile: publicUrlData.publicUrl,
    created_at: new Date()
  })
});
  addForm.reset();
  loadData();
  });

// Read data realtime
async function loadData() {
  // versi lama
  // const { data, error } = await supabase.from("test_crud").select("*").order("id");
  // if (!error) {
  //   renderData(data);
  // }

  // versi baru
  const res = await fetch("/api/select");
const data = await res.json();
renderData(data);
}

function renderData(rows) {
  dataList.innerHTML = "";
  rows.forEach((row) => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <img src="${row.gambar_profile}" alt="">
      <div>${row.nama} (${row.umur} th)</div>
      <button onclick="deleteData(${row.id})">Hapus</button>
    `;
    dataList.appendChild(div);
  });
}

// Delete data
async function deleteData(id) {
  // versi lama
  // const { error } = await supabase.from("test_crud").delete().eq("id", id);
  // if (error) console.error(error);

  // versi baru
  await fetch(`/api/delete/${id}`, { method: "DELETE" });
  loadData();
}

// Realtime listener
supabase.channel("table-db-changes")
  .on("postgres_changes", { event: "*", schema: "public", table: "test_crud" }, payload => {
    loadData();
  })
  .subscribe();

// Load awal
loadData();
