document.addEventListener('DOMContentLoaded', () => {
    loadApplications();
});

async function loadApplications() {
    try {
        const response = await fetch('/api/applications');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const applications = await response.json();
        const tableBody = document.getElementById('applications-table-body');
        tableBody.innerHTML = ''; // Clear existing rows
        applications.forEach(appData => {
            const row = createTableRow(appData.id, appData);
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching data from server: ", error);
        loadFallbackData();
    }
}

function loadFallbackData() {
    console.log('Loading from local fallback data.');
    fetch('/data.json')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('applications-table-body');
            tableBody.innerHTML = '';
            data.forEach(appData => {
                // Note: Fallback data doesn't support status updates
                const row = createTableRow(appData.id, appData, false);
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error loading fallback data:', error));
}


function createTableRow(id, data, isUpdateEnabled = true) {
    const row = document.createElement('tr');

    const companyCell = document.createElement('td');
    const companyLink = document.createElement('a');
    companyLink.href = `cover-letter.html?id=${id}`;
    companyLink.textContent = data.company;
    companyCell.appendChild(companyLink);

    const titleCell = document.createElement('td');
    titleCell.textContent = data['job-title'];

    const dateCell = document.createElement('td');
    const date = new Date(data.date);
    dateCell.textContent = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const statusCell = document.createElement('td');
    const statusSelect = document.createElement('select');
    const statuses = ['In Progress', 'Submitted', 'Corresponding', 'Interviewing'];
    statuses.forEach(status => {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = status;
        if (data.status === status) {
            option.selected = true;
        }
        statusSelect.appendChild(option);
    });

    if (isUpdateEnabled) {
        statusSelect.addEventListener('change', (event) => {
            updateStatus(id, event.target.value);
        });
    } else {
        statusSelect.disabled = true;
    }
    statusCell.appendChild(statusSelect);

    row.appendChild(companyCell);
    row.appendChild(titleCell);
    row.appendChild(dateCell);
    row.appendChild(statusCell);

    return row;
}

async function updateStatus(docId, newStatus) {
    try {
        const response = await fetch(`/api/applications/${docId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }),
        });
        if (!response.ok) {
            throw new Error('Failed to update status');
        }
        console.log("Status updated successfully");
    } catch (error) {
        console.error("Error updating status: ", error);
    }
}