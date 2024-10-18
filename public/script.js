const apiUrl = 'https://story-phi.vercel.app//api/stories';

// Fungsi untuk membuka modal
function openModal() {
    document.getElementById("modal").style.display = "block";
}

// Fungsi untuk menutup modal
function closeModal() {
    document.getElementById("modal").style.display = "none";
}

// Fungsi untuk mendapatkan IP Address pengguna
async function getUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Error getting IP:', error);
        return null;
    }
}

// Fungsi untuk menambahkan cerita ke db.json
async function addStory() {
    const storyInput = document.getElementById('storyInput');
    const usernameInput = document.getElementById('usernameInput');
    const storyText = storyInput.value.trim();
    const username = usernameInput.value.trim();
    const userIP = await getUserIP();

    if (storyText !== '' && username !== '' && userIP) {
        const story = {
            id: Date.now(), // Menggunakan timestamp sebagai ID unik
            content: storyText,
            username: username,
            ip: userIP
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(story)
            });

            if (response.ok) {
                const newStory = await response.json();
                displayStory(newStory);
                closeModal(); // Tutup modal setelah menambah postingan
                storyInput.value = '';
                usernameInput.value = ''; // Clear username input
            } else {
                alert('Gagal mengunggah cerita.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat menghubungkan ke server.');
        }
    } else {
        alert('Nama dan ceritamu tidak boleh kosong atau tidak bisa mendapatkan IP.');
    }
}

// Fungsi untuk menampilkan cerita dari db.json ke halaman
function displayStory(story) {
    const storyList = document.getElementById('storyList');
    const storyDiv = document.createElement('div');
    storyDiv.classList.add('story');
    storyDiv.setAttribute('data-id', story.id); // Menyimpan ID di atribut data

    // Tambahkan elemen untuk nama pengguna
    const usernameElement = document.createElement('h4');
    usernameElement.textContent = `Dari: ${story.username}`;
    storyDiv.appendChild(usernameElement);

    // Tambahkan elemen untuk konten cerita
    const storyContent = document.createElement('p');
    storyContent.textContent = story.content;
    storyDiv.appendChild(storyContent);

    // Tambahkan tombol hapus
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Hapus';
    deleteButton.onclick = async () => {
        const currentIP = await getUserIP();
        // Memverifikasi pemilik cerita berdasarkan IP dan ID
        if (currentIP === story.ip) {
            deleteStory(story.id, storyDiv);
        } else {
            alert('Anda tidak memiliki izin untuk menghapus cerita ini.');
        }
    };
    storyDiv.appendChild(deleteButton);

    storyList.appendChild(storyDiv);
}

// Fungsi untuk menghapus cerita dari db.json dan halaman
async function deleteStory(id, storyElement) {
    try {
        const response = await fetch(`${apiUrl}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            storyElement.remove();
        } else {
            alert('Gagal menghapus cerita.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat menghubungkan ke server.');
    }
}

// Fungsi untuk mengambil cerita dari db.json saat halaman dimuat
async function fetchStories() {
    try {
        const response = await fetch(apiUrl);
        const stories = await response.json();

        stories.forEach(story => displayStory(story));
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat menghubungkan ke server.');
    }
}

// Ambil cerita saat halaman dimuat
window.onload = fetchStories;

// Tambahkan event listener untuk tombol
document.getElementById("openModalButton").onclick = openModal;
