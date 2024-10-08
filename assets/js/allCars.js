import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-firestore.js";

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

// Function to fetch and display cars
// async function fetchAndDisplayCars(filters = {}) {
//     const carList = document.getElementById('car-list');
//     carList.innerHTML = ''; // Clear previous results

//     const carsRef = collection(db, 'cars');
//     let q = query(carsRef);
    
//     // Add filters to the query
//     if (filters.make) q = query(carsRef, where('make', '==', filters.make));
//     if (filters.model) q = query(q, where('model', '==', filters.model));
//     if (filters.price) q = query(q, where('price', '<=', filters.price));

//     const snapshot = await getDocs(q);
//     snapshot.forEach(doc => {
//         const car = doc.data();
//         const carHTML = `
//             <div class="single-car col-md-6">
//                 <div class="card">
//                     <img src="${car.imageUrls[0]}" alt="Car Image">
//                     <div class="card-body">
//                         <h5>${car.make} ${car.model}</h5>
//                         <p>Price: $${car.price}</p>
//                         <button onclick="viewDetails('${doc.id}')" class="btn btn-primary">View Details</button>
//                     </div>
//                 </div>
//             </div>
//         `;
//         carList.innerHTML += carHTML;
//     });
// }
async function fetchAndDisplayCars(filters = {}) {
    const carList = document.getElementById('car-list');
    carList.innerHTML = ''; // Clear previous results

    const carsRef = collection(db, 'cars');
    let q = query(carsRef);

    // Add filters to the query
    if (filters.make && filters.make !== 'default') q = query(q, where('make', '==', filters.make));
    if (filters.model) q = query(q, where('model', '==', filters.model));
    if (filters.price) q = query(q, where('price', '<=', filters.price));
    if (filters.year && filters.year !== 'default') q = query(q, where('year', '==', filters.year));
    if (filters.bodyStyle && filters.bodyStyle !== 'default') q = query(q, where('bodyStyle', '==', filters.bodyStyle));
    if (filters.condition && filters.condition !== 'default') q = query(q, where('condition', '==', filters.condition));
    if (filters.mileage) q = query(q, where('mileage', '<=', filters.mileage));

    const snapshot = await getDocs(q);
    const totalCars = snapshot.size;

    // Show the number of cars found
    const searchTitle = document.getElementById('searchTitle');
    if (totalCars === 0) {
        searchTitle.innerHTML = 'No cars found.';
    } else if (totalCars === 1) {
        searchTitle.innerHTML = '1 car found.';
    } else {
        searchTitle.innerHTML = `${totalCars} cars found.`;
    }

    // Display cars
    snapshot.forEach(doc => {
        const car = doc.data();
        const carHTML = `
            <div class="single-car col-md-6">
                <div class="card">
                    <img src="${car.imageUrls[0]}" alt="Car Image" class="car-image">
                    <div class="card-body">
                        <h5>${car.make} ${car.model} (${car.year})</h5>
                        <p>Price: $${car.price}</p>
                        <p>Mileage: ${car.mileage} km</p>
                        <p>Condition: <span class="${car.condition === 'new' ? 'badge-new' : 'badge-used'}">${car.condition}</span></p>
                        <button onclick="viewDetails('${doc.id}')" class="btn btn-primary">View Details</button>
                    </div>
                </div>
            </div>
        `;
        carList.innerHTML += carHTML;
    });
}


// Event listener for search button
function searchCars() {
    const make = document.getElementById('searchMake').value;
    const model = document.getElementById('searchModel').value;
    const price = document.getElementById('priceRange').value;
    const year = document.getElementById('searchYear').value;
    const bodyStyle = document.getElementById('searchBodyStyle').value;
    const condition = document.getElementById('searchCondition').value;
    const mileage = document.getElementById('mileageRange').value;

    const filters = {
        make,
        model,
        price: parseInt(price) || null,
        year,
        bodyStyle,
        condition,
        mileage: parseInt(mileage) || null
    };

    fetchAndDisplayCars(filters);
}
window.searchCars = searchCars;


// Event listener for search
document.getElementById('searchBtn').addEventListener('click', function () {
    const make = document.getElementById('searchMake').value;
    const model = document.getElementById('searchModel').value;
    const price = document.getElementById('searchPrice').value;

    const filters = { make, model, price: parseInt(price) || null };
    fetchAndDisplayCars(filters);
});

// View details function
function viewDetails(carId) {
    window.location.href = `carDetails.html?id=${carId}`;
}
window.viewDetails = viewDetails;

// Load all cars on page load
fetchAndDisplayCars();
