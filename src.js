const formCoach = document.getElementById('coachForm');
const submitBtnCoach = formCoach.querySelector('button[type="submit"]');

formCoach.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(formCoach);
    formData.append("access_key", "32edf551-fab5-4e79-b9e1-b225ca342b76");

    const originalText = submitBtnCoach.textContent;

    submitBtnCoach.textContent = "Sending...";
    submitBtnCoach.disabled = true;

    try {
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            alert("Success! Your message has been sent.");
            formCoach.reset();
        } else {
            alert("Error: " + data.message);
        }

    } catch (error) {
        alert("Something went wrong. Please try again.");
    } finally {
        submitBtnCoach.textContent = originalText;
        submitBtnCoach.disabled = false;
    }
});


const formVolunteer = document.getElementById('volunteerForm');
const submitBtnVolunteer = formVolunteer.querySelector('button[type="submit"]');

formVolunteer.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(formVolunteer);
    formData.append("access_key", "59e5a553-45c4-406b-bd8c-c05cc26ebbe2");

    const originalText = submitBtnVolunteer.textContent;

    submitBtnVolunteer.textContent = "Sending...";
    submitBtnVolunteer.disabled = true;

    try {
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            alert("Success! Your message has been sent.");
            formVolunteer.reset();
        } else {
            alert("Error: " + data.message);
        }

    } catch (error) {
        alert("Something went wrong. Please try again.");
    } finally {
        submitBtnVolunteer.textContent = originalText;
        submitBtnVolunteer.disabled = false;
    }
});