// Contact form
document.getElementById("contactForm").addEventListener("submit", function(e){
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();

  if(name && email && message){
    document.getElementById("formMessage").textContent = "Thank you! We'll get back to you soon.";
    document.getElementById("contactForm").reset();
  } else {
    document.getElementById("formMessage").textContent = "Please fill all fields.";
  }
});

// Mobile menu toggle
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('nav ul');
toggle.addEventListener('click', () => {
  nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
});