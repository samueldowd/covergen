document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const docId = urlParams.get('id');
    if (docId) {
        loadLetterData(docId);
    }

    const printButton = document.getElementById('print-button');
    if (printButton) {
        printButton.addEventListener('click', () => {
            window.print();
        });
    }

    // Set the current date
    const dateElement = document.getElementById('date');
    if (dateElement) {
        const today = new Date();
        dateElement.textContent = today.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
});

async function loadLetterData(docId) {
    try {
        const response = await fetch(`/api/jobs/${docId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        populateLetter(data);
    } catch (error) {
        console.error("Error fetching letter data from server:", error);
        loadFallbackLetterData(docId);
    }
}

function loadFallbackLetterData(docId) {
    console.log('Loading letter from local fallback data.');
    fetch('/data.json')
        .then(response => response.json())
        .then(data => {
            // Note: docId from URL is a string, which matches fallback data id type
            const letterData = data.find(item => item.id === docId);
            if (letterData) {
                populateLetter(letterData);
            } else {
                console.error('No matching data found in fallback file.');
                document.getElementById('body').innerHTML = '<p>Error: Application data could not be loaded.</p>';
            }
        })
        .catch(error => console.error('Error loading fallback letter data:', error));
}

function populateLetter(data) {
    document.getElementById('greeting').innerHTML = data.greeting;
    document.getElementById('body').innerHTML = data.body;
    document.getElementById('salutation').innerHTML = data.salutation;
    document.documentElement.style.setProperty('--dynamic-color', data.color);
}