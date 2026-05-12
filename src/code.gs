/**
 * FILE: code.gs
 * Silakan salin semua kode ini ke Google Apps Script (Extensions > Apps Script) di Google Sheets Anda.
 * 
 * KONSEP SAAS:
 * 1. Spreadsheet Master ini berisi "Database Lisensi" (Daftar Klien/Sekolah).
 * 2. Fungsi buatClientBaru akan menduplikasi template atau membuat Spreadsheet baru untuk Klien.
 */

// 1. SETUP MENU & ONOPEN
function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('⚙️ SAAS System Admin')
      .addItem('Setup Database Lisensi', 'setupDatabase')
      .addItem('Buat Client Baru', 'buatClientBaruUI')
      .addToUi();
  } catch (e) {
    Logger.log("Sistem mendeteksi dijalankan dari Editor! Untuk melihat Menu, Anda harus membuka dan refresh tab Google Sheets Anda (bukan tab Editor Apps Script).");
  }
}

// 2. SETUP DATABASE MASTER
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('License_Data');
  
  if (!sheet) {
    sheet = ss.insertSheet('License_Data');
    sheet.appendRow(['Client ID', 'Nama Sekolah', 'Link Url Spreadsheet Klien', 'Link Url Google Drive Klien', 'Status', 'Spreadsheet ID', 'Tanggal Dibuat', 'Tanggal Expired']);
    sheet.getRange("A1:H1").setFontWeight("bold").setBackground("#d0e0e3");
    SpreadsheetApp.getUi().alert('✅ Database Lisensi berhasil dibuat!');
  } else {
    SpreadsheetApp.getUi().alert('⚠️ Database Lisensi sudah ada.');
  }
}

// 3. FUNGSI MEMBUAT CLIENT BARU DARI SISI GOOGLE SCRIPT UI
function buatClientBaruUI() {
  const ui = SpreadsheetApp.getUi();
  const res = ui.prompt('Buat Klien SAAS Baru', 'Masukkan Nama Sekolah/Institusi:', ui.ButtonSet.OK_CANCEL);
  
  if (res.getSelectedButton() == ui.Button.OK) {
    const namaSekolah = res.getResponseText();
    buatClientBaru(namaSekolah);
  }
}

// 4. LOGIC MEMBUAT CLIENT BARU (SPREADSHEET TERPISAH)
function buatClientBaru(namaSekolah) {
  try {
    const ssMaster = SpreadsheetApp.getActiveSpreadsheet();
    const sheetMaster = ssMaster.getSheetByName('License_Data');
    
    if (!sheetMaster) throw new Error("Silakan jalankan Setup Database Lisensi terlebih dahulu.");

    // Buat Spreadsheet baru untuk database klien
    const ssClientBaru = SpreadsheetApp.create("DB Klien - " + namaSekolah);
    const clientId = "CLI-" + Math.floor(1000 + Math.random() * 9000);
    const clientDbId = ssClientBaru.getId();
    
    // Setup Sheet di Client Baru
    const sheetUsers = ssClientBaru.getSheetByName('Sheet1');
    sheetUsers.setName('Users');
    sheetUsers.appendRow(['ID', 'Username/NIS', 'Password', 'Role', 'Nama Lengkap']);
    
    const sheetAbsensi = ssClientBaru.insertSheet('Absensi');
    sheetAbsensi.appendRow(['Timestamp', 'NIS', 'Nama Siswa', 'Status', 'Metode']);

    const sheetKelas = ssClientBaru.insertSheet('Kelas');
    sheetKelas.appendRow(['ID Kelas', 'Nama Kelas', 'Wali Kelas']);

    // Daftarkan Admin Master untuk Client Tersebut
    sheetUsers.appendRow(['ADM-001', 'admin_' + clientId.toLowerCase(), 'admin123', 'admin', 'Admin ' + namaSekolah]);

    // Simpan ke Master License
    const createdAt = new Date().toLocaleString();
    const expiredAt = new Date();
    expiredAt.setFullYear(expiredAt.getFullYear() + 1); // 1 tahun masa aktif
    
    const spreadsheetUrl = ssClientBaru.getUrl();
    // Mendapatkan folder dari spreadsheet (opsional, tapi url drive bisa pakai file id / open)
    const driveUrl = "https://drive.google.com/open?id=" + clientDbId;

    sheetMaster.appendRow([clientId, namaSekolah, spreadsheetUrl, driveUrl, 'ACTIVE', clientDbId, createdAt, expiredAt.toLocaleString()]);
    
    SpreadsheetApp.getUi().alert(`✅ Client ${namaSekolah} berhasil dibuat!\nSpreadsheet ID: ${clientDbId}\nSilakan berikan ID ini ke frontend.`);
    
    return {
      status: "success",
      clientId: clientId,
      spreadsheetId: clientDbId
    };

  } catch (error) {
    SpreadsheetApp.getUi().alert('Error: ' + error.message);
    return { status: "error", message: error.message };
  }
}

// 5. REST API: doGet (Untuk GET Request dari Frontend)
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    message: "Google Apps Script API Aktif."
  })).setMimeType(ContentService.MimeType.JSON);
}

// 6. REST API: doPost (Untuk Otentikasi & Input Data Absensi via Fetch/Axios API di React)
function doPost(e) {
  const output = { status: "error", message: "Unknown action" };
  
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    // API Route: Login
    if (action === "LOGIN") {
      // Logic pengecekan dari spreadsheet klien akan berada disini
      // Membutuhkan data.clientDbId, data.username, data.password, data.role
       output.status = "success";
       output.message = "Simulasi Login Berhasil";
    }
    
    // API Route: Catat Absensi (QR Scan)
    if (action === "SUBMIT_ABSENSI") {
       // Logic membuka DB Klien dan menginput ke Sheet 'Absensi'
       output.status = "success";
       output.message = "Siswa berhasil diabsen.";
    }

  } catch (err) {
    output.message = err.message;
  }
  
  return ContentService.createTextOutput(JSON.stringify(output)).setMimeType(ContentService.MimeType.JSON);
}
