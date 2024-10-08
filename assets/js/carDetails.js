import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-firestore.js";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBDMAzGX_3eIkfFTaz-CdIjTHgxJvle7-g",
    authDomain: "carsales-6433d.firebaseapp.com",
    projectId: "carsales-6433d",
    storageBucket: "carsales-6433d.appspot.com",
    messagingSenderId: "936369720694",
    appId: "1:936369720694:web:010c3e995aad2d17e8be57"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Wait for the DOM to be fully loaded before executing the code
document.addEventListener('DOMContentLoaded', function () {
    let currentImageIndex = 0;

    // Function to fetch car details by ID and display them
    async function fetchCarDetails(carId) {
        const carDocRef = doc(db, 'cars', carId);
        const carDoc = await getDoc(carDocRef);
        const car = carDoc.data();

        if (car) {
            const largeImage = document.getElementById('largeImage');
            const thumbnails = document.getElementById('thumbnails');
            let imageUrls = car.imageUrls;

            // Set initial image and thumbnails
            largeImage.src = imageUrls[0]; // Set the first image as large image
            currentImageIndex = 0;

            // Add thumbnails for other images
            thumbnails.innerHTML = ''; // Clear previous thumbnails
            imageUrls.forEach((url, index) => {
                const thumb = document.createElement('img');
                thumb.src = url;
                thumb.classList.add('thumbnail');
                if (index === 0) thumb.classList.add('active'); // First image is active
                thumb.addEventListener('click', function () {
                    largeImage.src = url; // Change large image on thumbnail click
                    document.querySelector('.thumbnail.active').classList.remove('active');
                    thumb.classList.add('active');
                    currentImageIndex = index;
                });
                thumbnails.appendChild(thumb);
            });

            // Keyboard navigation for images
            document.addEventListener('keydown', function (e) {
                if (e.key === 'ArrowRight') {
                    currentImageIndex = (currentImageIndex + 1) % imageUrls.length;
                } else if (e.key === 'ArrowLeft') {
                    currentImageIndex = (currentImageIndex - 1 + imageUrls.length) % imageUrls.length;
                }
                largeImage.src = imageUrls[currentImageIndex];
                document.querySelector('.thumbnail.active').classList.remove('active');
                thumbnails.children[currentImageIndex].classList.add('active');
            });

            // Set car details
            document.getElementById('carTitle').textContent = `${car.make} ${car.model}`;
            document.getElementById('carYear').textContent = car.year;
            document.getElementById('carPrice').textContent = `$${car.price}`;
            document.getElementById('carStyle').textContent = car.style;
            document.getElementById('carDescription').textContent = car.description;
            document.getElementById('carCondition').textContent = car.condition;
            document.getElementById('carMileage').textContent = car.mileage || 'N/A';
            document.getElementById('carTransmission').textContent = car.transmission || 'Manual';
        }
    }

    // Get car ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('id');

    // Load car details
    fetchCarDetails(carId);
});

document.getElementById('shareFacebook').addEventListener('click', function () {
    const url = window.location.href;
    const title = document.getElementById('carTitle').textContent;
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&t=${encodeURIComponent(title)}`;
    window.open(shareUrl, '_blank');
});

document.getElementById('shareTwitter').addEventListener('click', function () {
    const url = window.location.href;
    const title = document.getElementById('carTitle').textContent;
    const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
    window.open(shareUrl, '_blank');
});

document.getElementById('shareLinkedIn').addEventListener('click', function () {
    const url = window.location.href;
    const title = document.getElementById('carTitle').textContent;
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
    window.open(shareUrl, '_blank');
});

document.getElementById('shareWhatsApp').addEventListener('click', function () {
    const url = window.location.href;
    const title = document.getElementById('carTitle').textContent;
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(title)}%20${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank');
});

document.getElementById('shareEmail').addEventListener('click', function () {
    const url = window.location.href;
    const title = document.getElementById('carTitle').textContent;
    const shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=Check out this car: ${encodeURIComponent(url)}`;
    window.location.href = shareUrl;
});

// Function to open the modal with the large image
function openModal() {
    const modal = document.getElementById("imageModal");
    const modalImage = document.getElementById("modalImage");
    
    modal.style.display = "block"; // Show the modal
    modalImage.src = document.querySelector(".large-image").src; // Get the source of the large image
}

// Function to close the modal
function closeModal() {
    const modal = document.getElementById("imageModal");
    modal.style.display = "none"; // Hide the modal
}

// Add click event to the large image
document.querySelector(".large-image").onclick = openModal;
window.closeModal = closeModal;