import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js";
import { getFirestore, collection, getDocs, where, orderBy, limit, query } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBDMAzGX_3eIkfFTaz-CdIjTHgxJvle7-g",
    authDomain: "carsales-6433d.firebaseapp.com",
    projectId: "carsales-6433d",
    storageBucket: "carsales-6433d.appspot.com",
    messagingSenderId: "936369720694",
    appId: "1:936369720694:web:010c3e995aad2d17e8be57"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Initialize Firestore

$(document).ready(function(){
    // Function to fetch the last three cars
    async function fetchLastThreeCars() {
        const carsRef = collection(db, 'cars');
        const carsQuery = query(carsRef, orderBy('price'), limit(3)); // Limit to 3 cars
        const snapshot = await getDocs(carsQuery);
        
        const cars = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // console.log("Last three cars data: ", cars); // Log the last three cars fetched
        displayCars(cars); // Display the cars
    }

    // Call the function to fetch the last three cars
    fetchLastThreeCars();

    function displayCars(cars) {
        if (!cars || cars.length === 0) {
            console.error('No car data available.');
            return; // Exit if no car data
        }
    
        const $carsContainer = $('#new-cars-carousel');
        const placeholderImageUrl = 'https://firebasestorage.googleapis.com/v0/b/carsales-6433d.appspot.com/o/principalImage%2Fshowroom-placeholder.png?alt=media';

        // Destroy existing carousel (important!)
        $carsContainer.trigger('destroy.owl.carousel');
        $carsContainer.removeClass('owl-carousel owl-loaded'); // Reset classes
        $carsContainer.find('.owl-stage-outer').children().unwrap(); // Remove extra structure
        $carsContainer.empty(); // Clear the existing content
    
        // Loop through each car and create HTML
        cars.forEach(car => {
            const carImages = car.imageUrls && Array.isArray(car.imageUrls) ? car.imageUrls : [];
            // const principalImage = carImages.length > 0 ? carImages[0] : 'path/to/fallback-image.jpg'; // Fallback image
            const principalImage = car.principalImageUrl || (car.imageUrls.length > 0 ? car.imageUrls[0] : placeholderImageUrl);

            const carHTML = `
                <div class="new-cars-item">
                    <div class="single-new-cars-item">
                        <div class="row">
                            <div class="col-md-7 col-sm-12">
                                <div class="new-cars-img">
                                    <img src="${principalImage}" alt="Car Image" />
                                </div>
                            </div>
                            <div class="col-md-5 col-sm-12">
                                <div class="new-cars-txt">
                                    <h2><a href="#">${car.make} <span>${car.model}</span></a></h2>
                                    <p>Style: ${car.style}</p>
                                    <p>Price: $${car.price}</p>
                                    <p>Year: ${car.year}</p>
                                    <p>Condition: ${car.condition}</p>
                                    <p>Description: ${car.description}</p>
                                    <button onclick="viewDetails('${car.id}')" class="btn btn-primary">View Details</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            $carsContainer.append(carHTML); // Append the car HTML to the container
        });
    
        // Reinitialize the Owl Carousel after adding new content
        $carsContainer.addClass('owl-carousel'); // Add the carousel class back
        $carsContainer.owlCarousel({
            items: 1,
            autoplay: true,
            loop: true,
            dots: true,
            mouseDrag: true,
            nav: false,
            smartSpeed: 1000,
            transitionStyle: "fade",
            animateIn: 'fadeIn',
            animateOut: 'fadeOutLeft'
        });
    }
    
});
function viewDetails(carId) {
    window.location.href = `carDetails.html?id=${carId}`;
}
window.viewDetails = viewDetails;

// Fetch cars from Firestore and display them
async function fetchAndDisplayCars() {
    const carsContainer = document.getElementById('cars-container');
    const placeholderImageUrl = 'https://firebasestorage.googleapis.com/v0/b/carsales-6433d.appspot.com/o/principalImage%2Fshowroom-placeholder.png?alt=media';

    carsContainer.innerHTML = ''; // Clear existing content

    try {
        const querySnapshot = await getDocs(collection(db, "cars"));
        querySnapshot.forEach((doc) => {
            const carData = doc.data();
            const carImage = carData.principalImageUrl || (carData.imageUrls.length > 0 ? carData.imageUrls[0] : placeholderImageUrl);
            
            // Create car card HTML dynamically
            const carHTML = `
                <div class="col-md-3">
                    <div class="single-featured-cars">
                        <div class="featured-img-box">
                            <div class="featured-cars-img">
                                <img src="${carImage}" alt="car image">
                            </div>
                            <div class="featured-model-info">
                                <p>
                                    model: ${carData.year}
                                    <span class="featured-mi-span"> ${carData.mileage || 'N/A'} mi</span> 
                                    ${carData.transmission || 'Auto'}
                                </p>
                            </div>
                        </div>
                        <div class="featured-cars-txt">
                            <h2><a href="#">${carData.make} ${carData.model}</a></h2>
                            <h3>$${carData.price || 'N/A'}</h3>
                        </div>
                        <button onclick="viewDetails('${doc.id}')" class="btn btn-primary">View Details</button>
                        <div class="share-section">
                            <p>Share this car:</p>
                            <a href="#" class="btn-circle fb" data-url="${carImage}" id="facebook-share-${doc.id}"><i class="fab fa-facebook-f"></i></a>
                            <a href="#" class="btn-circle twitter" data-url="${carImage}" id="twitter-share-${doc.id}"><i class="fab fa-twitter"></i></a>
                            <a href="#" class="btn-circle messenger" data-url="${carImage}" id="messenger-share-${doc.id}"><i class="fab fa-facebook-messenger"></i></a>
                            <a href="#" class="btn-circle whatsapp" data-url="${carImage}" id="whatsapp-share-${doc.id}"><i class="fab fa-whatsapp"></i></a>
                            <a href="#" class="btn-circle instagram" data-url="${carImage}" id="instagram-share-${doc.id}"><i class="fab fa-instagram"></i></a>
                            <a href="#" class="btn-circle email" data-url="${carImage}" id="email-share-${doc.id}"><i class="fas fa-envelope"></i></a></a>
                            </div>
                    </div>
                </div>
            `;
            carsContainer.innerHTML += carHTML; // Add the car card to the container
        });

        // Attach event listeners after the cars are displayed
        attachShareEventListeners();
    } catch (error) {
        console.error("Error fetching cars: ", error);
    }
}

function attachShareEventListeners() {
    document.querySelectorAll('.single-featured-cars').forEach(function (carElement) {
        const carUrl = window.location.href;

        // Check if the buttons exist before adding event listeners
        const fbButton = carElement.querySelector('.fb');
        const twitterButton = carElement.querySelector('.twitter');
        const messengerButton = carElement.querySelector('.messenger');
        const whatsappButton = carElement.querySelector('.whatsapp');
        const instagramButton = carElement.querySelector('.instagram');
        const emailButton = carElement.querySelector('.email');

        if (fbButton) {
            fbButton.addEventListener('click', function (e) {
                e.preventDefault();
                const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(carUrl)}`;
                window.open(fbShareUrl, '_blank');
            });
        }

        if (twitterButton) {
            twitterButton.addEventListener('click', function (e) {
                e.preventDefault();
                const tweetUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(carUrl)}&text=Check out this car!`;
                window.open(tweetUrl, '_blank');
            });
        }

        if (messengerButton) {
            messengerButton.addEventListener('click', function (e) {
                e.preventDefault();
                const messengerUrl = `fb-messenger://share/?link=${encodeURIComponent(carUrl)}`;
                window.open(messengerUrl, '_blank');
            });
        }

        if (whatsappButton) {
            whatsappButton.addEventListener('click', function (e) {
                e.preventDefault();
                const whatsappUrl = `https://api.whatsapp.com/send?text=Check out this car! ${encodeURIComponent(carUrl)}`;
                window.open(whatsappUrl, '_blank');
            });
        }

        if (instagramButton) {
            instagramButton.addEventListener('click', function (e) {
                e.preventDefault();
                navigator.clipboard.writeText(carUrl).then(function() {
                    alert('Car URL copied to clipboard! You can now share it on Instagram.');
                }, function(err) {
                    console.error('Could not copy text: ', err);
                });
            });
        }

        if (emailButton) {
            emailButton.addEventListener('click', function (e) {
                e.preventDefault();
                const subject = 'Check out this car!';
                const body = `Hey, I found this car and thought you might like it: ${carUrl}`;
                const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                window.location.href = emailUrl;
            });
        }
    }, { passive: true });}


document.addEventListener("DOMContentLoaded", function() {
    fetchAndDisplayCars();
});

async function searchCars() { 
    const year = document.getElementById("year-select").value;
    const price = document.getElementById("price-range").value;
    const mileage = document.getElementById("mileage-range").value;
    const style = document.getElementById("style-select").value.toUpperCase();
    const make = document.getElementById("make-select").value;
    const condition = document.getElementById("condition-select").value;

    const carsCollection = collection(db, "cars");

    let queryConstraints = [];
    console.log("Selected year:", year);
    console.log("Selected price:", price);
    console.log("Selected mileage:", mileage);
    console.log("Selected style:", style);
    console.log("Selected make:", make);
    console.log("Selected condition:", condition);
    console.log("Query constraints:", queryConstraints);
    
    if (year !== 'default') {
        queryConstraints.push(where("year", "==", parseInt(year)));
    }

    if (price !== 'default') {
        queryConstraints.push(where("year", "<=", parseInt(year)));
    }

    // Add style, make, condition filters
    if (style !== 'DEFAULT') {
        queryConstraints.push(where("style", "==", style));
    }
    if (make !== 'default') {
        queryConstraints.push(where("make", "==", make));
    }
    if (condition !== 'default') {
        queryConstraints.push(where("condition", "==", condition));
    }

    // Perform the query
    let carQuery = query(carsCollection, ...queryConstraints);
    let carSnapshot = await getDocs(carQuery);
    
    let cars = [];
    carSnapshot.forEach(doc => {
        let car = doc.data();
        // Filter by price and mileage
        if (
            car.price <= parseInt(price) &&
            car.mileage <= parseInt(mileage)
        ) {
            cars.push(car);
        }
    });

    // Display results in the console or update the DOM
    console.log(cars);
    console.log("Selected year:2", year);
    console.log("Selected price2:", price);
    console.log("Selected mileage:2", mileage);
    console.log("Selected style2:", style);
    console.log("Selected make:2", make);
    console.log("Selected condition2:", condition);
    console.log("Query constraints:2", queryConstraints);

    // Clear previous results in the DOM
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";  // Clear previous results

    // Display the filtered cars in the DOM
    cars.forEach(car => {
        const carDiv = document.createElement("div");
        const carImage = (car.imageUrls && car.imageUrls.length > 0) 
            ? car.imageUrls[0] 
            : 'path/to/fallback-image.jpg'; // Fallback image if no images

        carDiv.innerHTML = `
            <h3>${car.make} ${car.model}</h3>
            <p>Price: $${car.price}</p>
            <p>Mileage: ${car.mileage} mi</p>
            <img src="${carImage}" alt="${car.make} ${car.model}" />
        `;
        resultsDiv.appendChild(carDiv);
    });
}
window.searchCars = searchCars;
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('.single-featured-cars').forEach(function (carElement) {
        const carId = carElement.querySelector('button').getAttribute('onclick').match(/viewDetails\('(.+?)'\)/)[1];
        const carUrl = window.location.origin + `/carDetails.html?id=${carId}`; // Construct the car's details page URL

        // Facebook Share
        carElement.querySelector('#facebook-share').addEventListener('click', function (e) {
            e.preventDefault();
            const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(carUrl)}`;
            window.open(fbShareUrl, '_blank');
        });

        // Twitter Share
        carElement.querySelector('#twitter-share').addEventListener('click', function (e) {
            e.preventDefault();
            const tweetUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(carUrl)}&text=Check out this car!`;
            window.open(tweetUrl, '_blank');
        });

        // Messenger Share
        carElement.querySelector('#messenger-share').addEventListener('click', function (e) {
            e.preventDefault();
            const messengerUrl = `fb-messenger://share/?link=${encodeURIComponent(carUrl)}`;
            window.open(messengerUrl, '_blank');
        });

        // WhatsApp Share
        carElement.querySelector('#whatsapp-share').addEventListener('click', function (e) {
            e.preventDefault();
            const whatsappUrl = `https://api.whatsapp.com/send?text=Check out this car! ${encodeURIComponent(carUrl)}`;
            window.open(whatsappUrl, '_blank');
        });

        // Instagram (opens Instagram app for mobile)
        carElement.querySelector('#instagram-share').addEventListener('click', function (e) {
            e.preventDefault();
            const instagramUrl = `https://www.instagram.com/?url=${encodeURIComponent(carUrl)}`;
            window.open(instagramUrl, '_blank');
        });

        // Email Share
        carElement.querySelector('#email-share').addEventListener('click', function (e) {
            e.preventDefault();
            const emailSubject = "Check out this car!";
            const emailBody = `Check out this car on our platform: ${carUrl}`;
            const emailUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
            window.open(emailUrl, '_blank');
        });
    });
});



