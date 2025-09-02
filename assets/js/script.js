document.addEventListener('DOMContentLoaded', () => {
    console.log("Bagikan situs ini, karya anak bangsa 🇮🇩")
    // Inisialisasi AOS
    AOS.init();
    drawImage();
    // Pastikan GSAP dan SplitText sudah dimuat
    if (typeof gsap !== 'undefined' && typeof SplitText !== 'undefined') {
        gsap.registerPlugin(SplitText);

        const title = document.querySelector('h1');

        if (title) {
            const mySplitText = new SplitText(title, { type: "chars, words" });
            const chars = mySplitText.chars;

            gsap.from(chars, {
                y: 20,
                opacity: 0,
                stagger: {
                    each: 0.05,
                    from: "center",
                    grid: "auto",
                    ease: "power2.out"
                },
                repeat: -1,
                delay: 0,
                repeatDelay: 3,
                yoyo: true,
                color: (i) => {
                    return i % 2 === 0 ? "#F784C5" : "#1B602F";
                }
            });
        }
    }
});

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const DEFAULT_CANVAS_WIDTH = 500;
const DEFAULT_CANVAS_HEIGHT = 300;
const upload = document.getElementById('upload');
const color1 = document.getElementById('color1');
const color2 = document.getElementById('color2');
const powerSlider = document.getElementById('power');
const downloadBtn = document.getElementById('download');
const resetBtn = document.getElementById('resetBtn');
const fileInputContainer = document.querySelector('.file-input-container');

let img = new Image();
let originalImageLoaded = false;
let fileName = '';

// Pindahkan semua event listener di luar DOMContentLoaded untuk menghindari masalah scope.
fileInputContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileInputContainer.classList.add('border-blue-500', 'bg-gray-700');
});

fileInputContainer.addEventListener('dragleave', () => {
    fileInputContainer.classList.remove('border-blue-500', 'bg-gray-700');
});

fileInputContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    fileInputContainer.classList.remove('border-blue-500', 'bg-gray-700');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

upload.addEventListener('change', (e) => {
    const files = e.target.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

function toggleFileInputVisibility(show) {
    if (show) {
        fileInputContainer.classList.remove('hidden-visually');
    } else {
        fileInputContainer.classList.add('hidden-visually');
    }
}

function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) {
        Swal.fire({
            icon: 'error',
            title: 'Tipe File Salah',
            text: 'Input gambar bro, jangan diawur ae kek DPR, suwe!',
            confirmButtonColor: '#F784C5',
            confirmButtonText: 'Okeoke bro🙏😂'
        });
        return;
    }

    // Tampilkan SweetAlert loading sebelum memproses file
    Swal.fire({
        title: 'Memproses Gambar',
        text: 'Mohon tunggu sebentar ya!',
        allowOutsideClick: false,
        background: '#1f2937',
        color: '#f784c5',
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        },
        willClose: () => {
            Swal.hideLoading();
        }
    }).then(() => {
        Swal.fire({
            title: 'Berhasil!',
            text: 'Gambar berhasil diunggah.',
            icon: 'success',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: '#1f2937',
            color: '#ffffff'
        });
    });


    fileName = file.name.split('.').slice(0, -1).join('.');

    const reader = new FileReader();
    reader.onload = (ev) => {
        img.onload = () => {
            originalImageLoaded = true;
            drawImage();
            toggleFileInputVisibility(false);
            Swal.close();
        };

        // event handler untuk error loading gambar
        img.onerror = () => {
            Swal.close(); // Tutup SweetAlert
            Swal.fire({
                icon: 'error',
                title: 'Gagal Memuat Gambar',
                text: 'Terjadi kesalahan saat memuat gambar. Coba lagi.',
                confirmButtonColor: '#F784C5'
            });
            toggleFileInputVisibility(true); // Tampilkan lagi input file
        };

        img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
}

function drawImage() {
    // Kosongkan kanvas sebelum menggambar yang baru
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (originalImageLoaded) {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        applyDuotone();
    } else {
        // Tampilkan placeholder teks jika gambar belum di-upload
        canvas.width = DEFAULT_CANVAS_WIDTH;
        canvas.height = DEFAULT_CANVAS_HEIGHT;
        drawPlaceholderText();
    }
}

function drawPlaceholderText() {
    // Atur ukuran dan gaya font
    const fontSize = Math.min(canvas.width, canvas.height) / 10;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; // Warna putih transparan
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Atur posisi teks di tengah kanvas
    const text = 'Hasil akan ditampilkan di sini.';
    const textX = canvas.width / 2;
    const textY = canvas.height / 2;

    // Gambar teks di kanvas
    ctx.fillText(text, textX, textY);
}

function applyDuotone() {
    if (!originalImageLoaded) return;
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    tempCtx.drawImage(img, 0, 0);
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;

    const c1 = hexToRgb(color1.value);
    const c2 = hexToRgb(color2.value);
    const power = parseFloat(powerSlider.value);

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        const mappedLum = Math.pow(lum, power);
        data[i] = c2.r * (1 - mappedLum) + c1.r * mappedLum;
        data[i + 1] = c2.g * (1 - mappedLum) + c1.g * mappedLum;
        data[i + 2] = c2.b * (1 - mappedLum) + c1.b * mappedLum;
    }

    ctx.putImageData(imageData, 0, 0);
}

function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
}

function resetApp() {
    if (color1.value !== '#f784c5' || color2.value !== '#1b602f') {
        Swal.fire({
            title: 'Yakin mau reset warna?',
            text: "Nilai warna akan kembali ke semula!",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#F784C5',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Iya, reset!',
            background: '#1f2937',
            color: '#ffffff'
        }).then((result) => {
            color1.value = '#f784c5';
            color2.value = '#1b602f';
            applyDuotone();
            Swal.fire({
                title: 'Berhasil!',
                text: 'Warna sudah di-reset.',
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                background: '#1f2937',
                color: '#ffffff'
            });
        })
        return;
    }
    // Validasi yang diperbaiki: periksa `originalImageLoaded`
    if (!originalImageLoaded) {
        Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Gambarnya aja kaga lu upload. Apanya yg mau lu reset? Tunjangan DPR?🤫',
            confirmButtonColor: '#F784C5',
            confirmButtonText: "Pengennya sih gitu😂",
            background: '#1f2937',
            color: '#ffffff'
        });
        return;
    }
    // Jika gambar sudah di-upload maka reset semua (gambar dan warna)
    Swal.fire({
        title: 'Yakin mau di-reset?',
        text: "Gambar di kanvas dan nilai warna akan kembali ke semula!",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#F784C5',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Iya, reset!',
        background: '#1f2937',
        color: '#ffffff'
    }).then((result) => {
        // Jika pengguna mengklik "Iya, reset!"
        if (result.isConfirmed) {
            // Lakukan proses reset di sini
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Reset nilai input warna ke nilai default
            color1.value = '#f784c5';
            color2.value = '#1b602f';

            originalImageLoaded = false;
            toggleFileInputVisibility(true);
            upload.value = '';

            canvas.height = DEFAULT_CANVAS_HEIGHT;
            canvas.width = DEFAULT_CANVAS_WIDTH;
            drawPlaceholderText();

            // Terapkan duotone ulang
            applyDuotone();

            // Opsional: Tampilkan SweetAlert sukses setelah reset
            Swal.fire({
                title: 'Berhasil!',
                text: 'Semua sudah di-reset.',
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                background: '#1f2937',
                color: '#ffffff'
            });
        }
    });
}

color1.addEventListener('input', applyDuotone);
color2.addEventListener('input', applyDuotone);
powerSlider.addEventListener('input', applyDuotone);
resetBtn.addEventListener('click', resetApp);
downloadBtn.addEventListener('click', () => {
    // Validasi yang diperbaiki: periksa `originalImageLoaded`
    if (!originalImageLoaded) {
        Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Gambarnya aja belum lu upload, apanya yang mau lu download? Slip gajilu yang kaga seberapa dibanding gaji yang katanya wakil rakyat itu?🤣',
            confirmButtonColor: '#F784C5',
            confirmButtonText: 'Jangan keras-keras abangkuh😅',
            background: '#1f2937',
            color: '#ffffff'
        });
        return;
    }

    if (!canvas.width || !canvas.height) {
        Swal.fire({
            icon: 'error',
            title: 'Gagal!',
            text: 'Gambar belum diproses. Silakan pilih gambar dan tunggu sebentar.',
            confirmButtonColor: '#F784C5'
        });
        return;
    }

    const link = document.createElement('a');
    link.download = `${fileName}-bphg-success.png`;
    link.href = canvas.toDataURL();
    link.click();

    Swal.fire({
        title: 'Berhasil!',
        text: 'Gambar berhasil diunduh.',
        icon: 'success',
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        delay: 2000,
        timer: 5000,
        timerProgressBar: true,
        background: '#1f2937',
        color: '#ffffff'
    });
});