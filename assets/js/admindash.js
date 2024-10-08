import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-storage.js";
import { addDoc, collection, getFirestore, getDocs, getDoc, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBDMAzGX_3eIkfFTaz-CdIjTHgxJvle7-g",
    authDomain: "carsales-6433d.firebaseapp.com",
    projectId: "carsales-6433d",
    storageBucket: "carsales-6433d.appspot.com",
    messagingSenderId: "936369720694",
    appId: "1:936369720694:web:010c3e995aad2d17e8be57"
};
// Firebase Configurations and Initializations
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

let isUpdating = false;
let currentCarId = null;
let currentPage = 1;
const carsPerPage = 4;

// Listen to form submission for adding/updating a car
// Listen to form submission for adding/updating a car
// Listen to form submission for adding/updating a car
// Listen to form submission for adding/updating a car
document.getElementById('addCarForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const make = document.getElementById('carMake').value;
    const model = document.getElementById('carModel').value;
    const year = parseInt(document.getElementById('carYear').value);
    const mileage = parseInt(document.getElementById('carMileage').value);
    const style = document.getElementById('carStyle').value;
    const condition = document.getElementById('carCondition').value;
    const price = parseFloat(document.getElementById('carPrice').value);
    const description = document.getElementById('carDescription').value;
    const carImages = document.getElementById('carImages').files;
    const principalImage = document.getElementById('carPrincipalImage').files[0];
    const carVideo = document.getElementById('carVideo').files[0];

    let principalImageUrl = '';
    let imageUrls = [];
    let videoUrl = '';

    // Check if updating or adding a new car
    if (isUpdating && currentCarId) {
        const carDoc = doc(db, 'cars', currentCarId);
        const existingCarData = (await getDoc(carDoc)).data();

        // If there's no principal image provided
        if (!principalImage) {
            if (existingCarData.imageUrls.length > 0) {
                // Use the first additional image as the principal image
                principalImageUrl = existingCarData.imageUrls[0];
                Swal.fire({
                    title: 'No Principal Image Provided',
                    text: 'You did not add a principal image, so we will use the first image as the principal one. You can change it anytime.',
                    icon: 'warning',
                    confirmButtonText: 'Okay'
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Allow the admin to continue without resetting the form
                    }
                });
            } else {
                // No images available, show alert and stop execution
                Swal.fire({
                    title: 'No Images Available',
                    text: 'Please upload at least one image.',
                    icon: 'error',
                    confirmButtonText: 'Okay'
                });
                return; // Exit if no images
            }
        } else {
            // Upload the principal image if provided
            const imageRef = ref(storage, `cars/images/${principalImage.name}`);
            const snapshot = await uploadBytesResumable(imageRef, principalImage);
            principalImageUrl = await getDownloadURL(snapshot.ref);
        }

        // Maintain existing image URLs
        imageUrls = existingCarData.imageUrls;

        // Upload new images if any
        if (carImages.length > 0) {
            for (let i = 0; i < carImages.length; i++) {
                const imageRef = ref(storage, `cars/images/${carImages[i].name}`);
                const snapshot = await uploadBytesResumable(imageRef, carImages[i]);
                const downloadUrl = await getDownloadURL(snapshot.ref);
                imageUrls.push(downloadUrl); // Append new images
            }
        }

        // Upload video if provided
        if (carVideo) {
            const videoRef = ref(storage, `cars/videos/${carVideo.name}`);
            const snapshot = await uploadBytesResumable(videoRef, carVideo);
            videoUrl = await getDownloadURL(snapshot.ref);
        }

        // Prepare the data for updating the document
        const dataToUpdate = {
            make,
            model,
            year,
            mileage,
            style,
            condition,
            price,
            description,
            principalImageUrl, // Use the principalImageUrl assigned above
            imageUrls, // This should always have a value
            videoUrl: videoUrl || existingCarData.videoUrl // Maintain existing video if not replaced
        };

        // Remove undefined values from the object
        for (const key in dataToUpdate) {
            if (dataToUpdate[key] === undefined) {
                delete dataToUpdate[key]; // Remove any undefined fields
            }
        }

        // Update the document with valid data only
        await updateDoc(carDoc, dataToUpdate);

        Swal.fire('Success', 'Car updated successfully!', 'success');
        isUpdating = false;
        currentCarId = null;
        document.getElementById('submit-btn').innerText = 'Add Car';
    } else {
        // Code for adding a new car would go here (not shown for brevity)
    }

    // Only reset the form if we are not updating
    if (!isUpdating) {
        document.getElementById('addCarForm').reset();
    }
    
    fetchAndDisplayCars();
});



// Fetch and display cars with pagination and image deletion
// Fetch and display cars with pagination and image deletion
async function fetchAndDisplayCars() {
    const carList = document.getElementById('admin-car-list');

    // Ensure the element exists before proceeding
    if (!carList) {
        console.error('Error: #admin-car-list element not found in the DOM.');
        return; // Stop further execution if the element is missing
    }

    const carsRef = collection(db, 'cars');
    const snapshot = await getDocs(carsRef);

    carList.innerHTML = ''; // Clear the list
    const placeholderImageUrl = 'https://firebasestorage.googleapis.com/v0/b/carsales-6433d.appspot.com/o/principalImage%2Fshowroom-placeholder.png?alt=media';

    const carsArray = snapshot.docs;
    const totalCars = carsArray.length;
    const start = (currentPage - 1) * carsPerPage;
    const end = start + carsPerPage;
    const carsToDisplay = carsArray.slice(start, end);

    carsToDisplay.forEach((doc) => {
        const car = doc.data();
        const displayImage = car.principalImageUrl || (car.imageUrls.length > 0 ? car.imageUrls[0] : placeholderImageUrl);

        // Create HTML for each image, including a delete button for each image
        const imageHTML = car.imageUrls.map((url, index) => `
            <div class="car-image-container">
                <img src="${url}" alt="Car Image ${index}" class="car-image zoomable-image" />
                <button onclick="deleteImage('${doc.id}', '${url}')">Delete Image</button>
            </div>
        `).join('');

        const carHTML = `
            <div class="car-item">
                <h3>${car.make} (${car.year})</h3>
                <p>Price: $${car.price}</p>
                <p>${car.description}</p>
                <p>Mileage: ${car.mileage}</p>
                <img src="${displayImage}" alt="Car Make: ${car.make}" class="car-image" />
                <div class="car-images">
                    ${imageHTML} <!-- Display the images with delete buttons -->
                
                <!-- Separator -->
        <hr class="separator" />
        <div class="action-buttons">
                <button onclick="updateCar('${doc.id}')">Update</button>
                <button onclick="deleteCar('${doc.id}')">Delete</button>
            </div>
        `;

        carList.innerHTML += carHTML;
    });

    document.getElementById('prev-page').style.display = currentPage > 1 ? 'inline-block' : 'none';
    document.getElementById('next-page').style.display = end < totalCars ? 'inline-block' : 'none';
}


// Function to delete a specific image
async function deleteImage(carId, imageUrl) {
    // Delete from Firebase Storage
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);

    // Update Firestore by removing the image URL from the array
    const carDoc = doc(db, 'cars', carId);
    const carData = (await getDoc(carDoc)).data();
    const updatedImageUrls = carData.imageUrls.filter(url => url !== imageUrl);

    await updateDoc(carDoc, {
        imageUrls: updatedImageUrls
    });

    Swal.fire({
        icon: 'success',
        title: 'Image deleted successfully!',
        showConfirmButton: false,
        timer: 1500
    });

    fetchAndDisplayCars(); // Refresh the list
}

// Delete a car
async function deleteCar(id) {
    await deleteDoc(doc(db, 'cars', id));
    Swal.fire({
        icon: 'success',
        title: 'Car deleted successfully!',
        showConfirmButton: false,
        timer: 1500
    });
    fetchAndDisplayCars();
}

window.deleteCar = deleteCar;
window.deleteImage = deleteImage;

// Update car logic with scroll fix
async function updateCar(id) {
    isUpdating = true;
    currentCarId = id;
    document.getElementById('submit-btn').innerText = 'Update Car';

    const carDoc = doc(db, 'cars', id);
    const carData = (await getDoc(carDoc)).data();

    document.getElementById('carMake').value = carData.make;
    document.getElementById('carModel').value = carData.model;
    document.getElementById('carYear').value = carData.year;
    document.getElementById('carMileage').value = carData.mileage;
    document.getElementById('carStyle').value = carData.style;
    document.getElementById('carCondition').value = carData.condition;
    document.getElementById('carPrice').value = carData.price;
    document.getElementById('carDescription').value = carData.description;

    // Scroll into view for small screens
    const formSection = document.getElementById('form-section');
    if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Prepare form submission
    document.getElementById('addCarForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        const make = document.getElementById('carMake').value;
        const model = document.getElementById('carModel').value;
        const year = parseInt(document.getElementById('carYear').value);
        const mileage = parseInt(document.getElementById('carMileage').value);
        const style = document.getElementById('carStyle').value;
        const condition = document.getElementById('carCondition').value;
        const price = parseFloat(document.getElementById('carPrice').value);
        const description = document.getElementById('carDescription').value;
        const carImages = document.getElementById('carImages').files;
        const principalImage = document.getElementById('carPrincipalImage').files[0];
        const carVideo = document.getElementById('carVideo').files[0];

        let principalImageUrl = carData.principalImageUrl; // Use existing image if no new one provided
        let imageUrls = carData.imageUrls; // Use existing images if no new ones are provided
        let videoUrl = carData.videoUrl;

        // If there's a new principal image, upload it and get the URL
        if (principalImage) {
            const imageRef = ref(storage, `cars/images/${principalImage.name}`);
            const snapshot = await uploadBytesResumable(imageRef, principalImage);
            principalImageUrl = await getDownloadURL(snapshot.ref);
        }

        // If new images are provided, upload them and replace the existing imageUrls array
        if (carImages.length > 0) {
            imageUrls = [];
            for (let i = 0; i < carImages.length; i++) {
                const imageRef = ref(storage, `cars/images/${carImages[i].name}`);
                const snapshot = await uploadBytesResumable(imageRef, carImages[i]);
                const downloadUrl = await getDownloadURL(snapshot.ref);
                imageUrls.push(downloadUrl);
            }
        }

        // If there's a new video, upload it and get the URL
        if (carVideo) {
            const videoRef = ref(storage, `cars/videos/${carVideo.name}`);
            const snapshot = await uploadBytesResumable(videoRef, carVideo);
            videoUrl = await getDownloadURL(snapshot.ref);
        }

        // Update the document with valid data only
        await updateDoc(carDoc, {
            make,
            model,
            year,
            mileage,
            style,
            condition,
            price,
            description,
            principalImageUrl: principalImageUrl || carData.principalImageUrl, // Retain existing principal image if not replaced
            imageUrls: imageUrls.length > 0 ? imageUrls : carData.imageUrls, // Retain existing additional images
            videoUrl: videoUrl || carData.videoUrl // Retain existing video if not replaced
        });

        Swal.fire('Success', 'Car updated successfully!', 'success');
        isUpdating = false;
        currentCarId = null;
        document.getElementById('submit-btn').innerText = 'Add Car';
        document.getElementById('addCarForm').reset();
        fetchAndDisplayCars();
    });
}


window.updateCar = updateCar;

// Pagination buttons
document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchAndDisplayCars();
    }
});

document.getElementById('next-page').addEventListener('click', () => {
    currentPage++;
    fetchAndDisplayCars();
});

// Initial call to fetch and display cars
fetchAndDisplayCars();
