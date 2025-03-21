document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signup-form');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // Client-side validation
        if (!name || !email || !password || !confirmPassword) {
            alert('All fields are required');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        // Prepare data to send to the server
        const data = { name, email, password, confirmPassword };

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                window.location.href = '/home.html'; // Redirect to home page
            } else {
                const result = await response.json();
                alert(result.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    });
});

/* scriptfor home page*/
document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        initialDate: new Date(),
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: [
            {
                title: 'Today',
                start: new Date(),
                allDay: true,
                backgroundColor: '#ff9f89',
                textColor: '#000'
            }
        ]
    });
    calendar.render();
});

document.addEventListener('DOMContentLoaded', function () {
    const newTaskBtn = document.getElementById('new-task-btn');
    const overlay = document.getElementById('overlay');
    const taskModal = document.getElementById('task-modal');
    const closeModal = document.getElementById('close-modal');
    const cancelBtn = document.getElementById('cancel-btn');
    const plusIcons = document.querySelectorAll('.plus-icon'); // Select all plus icons

    // Function to open the modal
    function openModal() {
        overlay.style.display = 'block';
        taskModal.style.display = 'block';
    }

    // Open modal for "New Task" button
    newTaskBtn.addEventListener('click', openModal);

    // Open modal for plus icons
    plusIcons.forEach(icon => {
        icon.addEventListener('click', function () {
            const category = this.getAttribute('data-category'); // Get the category from the plus icon
            const categoryRadio = document.querySelector(`input[name="task-category"][value="${category}"]`);
            if (categoryRadio) {
                categoryRadio.checked = true; // Pre-select the category in the modal
            }
            openModal(); // Open the modal
        });
    });

    // Close modal
    closeModal.addEventListener('click', () => {
        overlay.style.display = 'none';
        taskModal.style.display = 'none';
    });

    cancelBtn.addEventListener('click', () => {
        overlay.style.display = 'none';
        taskModal.style.display = 'none';
    });

    overlay.addEventListener('click', () => {
        overlay.style.display = 'none';
        taskModal.style.display = 'none';
    });

    // Prevent past dates
    const taskDate = document.getElementById('task-date');
    taskDate.min = new Date().toISOString().split('T')[0];

    // Handle form submission
    const taskForm = document.getElementById('task-form');
    taskForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const taskName = document.getElementById('task-name').value;
        const taskCategory = document.querySelector('input[name="task-category"]:checked').value;
        const taskDate = document.getElementById('task-date').value;
        const startTime = document.getElementById('start-time').value;
        const endTime = document.getElementById('end-time').value;
        const taskDescription = document.getElementById('task-description').value;

        // Validate end time is after start time
        if (startTime >= endTime) {
            alert('End time must be after start time.');
            return;
        }

        // Submit data to the database (you can use fetch or axios for this)
        const taskData = {
            name: taskName,
            category: taskCategory,
            date: taskDate,
            startTime: startTime,
            endTime: endTime,
            description: taskDescription
        };

        console.log('Task Data:', taskData); // Replace with your database submission logic

        // Clear form and close modal
        taskForm.reset();
        overlay.style.display = 'none';
        taskModal.style.display = 'none';
    });
});