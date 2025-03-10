// Animate elements on scroll
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.animate-on-scroll');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight - 100) {
            element.classList.add('animate');
        }
    });
};

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Hero section video background toggle
const videoBackground = document.querySelector('.hero-video');
if (videoBackground) {
    videoBackground.playbackRate = 0.7;
}

// Social media share buttons
function shareOnSocial(platform) {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent('Check out this amazing softball match!');
    
    const links = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
        whatsapp: `https://wa.me/?text=${text}%20${url}`
    };
    
    window.open(links[platform], '_blank');
}

// Video gallery modal
function openVideoModal(videoId) {
    const modal = document.getElementById('videoModal');
    const videoFrame = document.getElementById('videoFrame');
    videoFrame.src = `https://www.youtube.com/embed/${videoId}`;
    modal.style.display = 'flex';
}

function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    const videoFrame = document.getElementById('videoFrame');
    videoFrame.src = '';
    modal.style.display = 'none';
}

// Initialize animations on scroll
window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);

// Add smooth hover effect to team cards
const teamCards = document.querySelectorAll('.team-card');
teamCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});
