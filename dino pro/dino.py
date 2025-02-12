import pygame
import random

# Initialize Pygame
pygame.init()

# Constants
WIDTH, HEIGHT = 1200, 600  # Resolution for fullscreen
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
GROUND_HEIGHT = HEIGHT - 80  # Adjusted for scaling

# Create screen (Fullscreen mode)
screen = pygame.display.set_mode((WIDTH, HEIGHT), pygame.FULLSCREEN)
pygame.display.set_caption("Dino Game")
clock = pygame.time.Clock()

# Load assets
dino_run = [pygame.transform.scale(pygame.image.load("assets/dino/dino_run1.png"), (60, 60)),
            pygame.transform.scale(pygame.image.load("assets/dino/dino_run2.png"), (60, 60))]
dino_jump = pygame.transform.scale(pygame.image.load("assets/dino/dino_jump.png"), (60, 60))

# Load different types of cacti
cactus_imgs = [
    pygame.transform.scale(pygame.image.load("assets/cacti/cactus1.png"), (40, 40)),
    pygame.transform.scale(pygame.image.load("assets/cacti/cactus2.png"), (40, 40)),
    pygame.transform.scale(pygame.image.load("assets/cacti/cactus3.png"), (40, 40)),
    pygame.transform.scale(pygame.image.load("assets/cacti/large_cactus1.png"), (50, 50)),
    pygame.transform.scale(pygame.image.load("assets/cacti/large_cactus2.png"), (50, 50))
]

# Load bird animations
bird_imgs = [pygame.transform.scale(pygame.image.load("assets/bird/bird1.png"), (50, 50)),
             pygame.transform.scale(pygame.image.load("assets/bird/bird2.png"), (50, 50))]

# Load other assets
cloud_img = pygame.transform.scale(pygame.image.load("assets/other/Cloud.png"), (70, 40))
track_img = pygame.image.load("assets/other/Track.png")
game_over_img = pygame.image.load("assets/other/GameOver.png")
reset_img = pygame.image.load("assets/Other/Reset.png")

# Dino class represents the player
class Dino:
    def __init__(self):
        self.x = 100  # Initial position
        self.y = GROUND_HEIGHT - 60
        self.vel_y = 0  # Vertical velocity
        self.is_jumping = False
        self.run_index = 0  # Animation index
    
    def jump(self):
        if not self.is_jumping:
            self.is_jumping = True
            self.vel_y = -18  # Increased jump height
    
    def update(self):
        self.vel_y += 1.4  # Apply gravity
        self.y += self.vel_y
        if self.y >= GROUND_HEIGHT - 60:
            self.y = GROUND_HEIGHT - 60
            self.is_jumping = False  # Reset jump state
    
    def draw(self):
        if self.is_jumping:
            screen.blit(dino_jump, (self.x, self.y))
        else:
            screen.blit(dino_run[self.run_index // 5], (self.x, self.y))
            self.run_index = (self.run_index + 1) % 10  # Loop run animation

# Obstacle class handles cacti and birds
class Obstacle:
    def __init__(self):
        self.type = random.choice(["cactus", "bird"])
        self.quantity = random.randint(1, 2) if self.type == "cactus" else 1
        if self.type == "cactus":
            self.images = [random.choice(cactus_imgs) for _ in range(self.quantity)]
            self.y = GROUND_HEIGHT - 40  # Position cacti on the ground
            self.x = WIDTH
        else:
            self.images = bird_imgs
            self.y = GROUND_HEIGHT - random.choice([90, 140])  # Position birds at different heights
            self.x = WIDTH
        self.speed = 12  # Initial speed of obstacles
        self.bird_index = 0  # Animation index for bird
    
    def update(self):
        self.x -= self.speed  # Move left
        if self.type == "bird":
            self.bird_index = (self.bird_index + 1) % 10  # Animate bird
    
    def draw(self):
        if self.type == "bird":
            screen.blit(self.images[self.bird_index // 5], (self.x, self.y))
        else:
            for i, img in enumerate(self.images):
                screen.blit(img, (self.x + i * 50, self.y))
    
    def off_screen(self):
        return self.x < -50  # Remove obstacles off screen
    
    def collision(self, dino):
        return any(
            dino.x < self.x + i * 50 + 30 and dino.x + 50 > self.x + i * 50 and dino.y + 50 > self.y
            for i in range(len(self.images))
        )

# Game elements
clouds = [[random.randint(800, 1600), random.randint(50, 150)] for _ in range(3)]
track_x = 0  # Track scrolling position

def reset_game():
    global obstacles, score, running, dino
    obstacles.clear()
    score = 0
    dino = Dino()  # Reinitialize Dino
    running = True

dino = Dino()
obstacles = []
running = True
score = 0

def draw_game_over():
    screen.blit(game_over_img, (WIDTH // 2 - 100, HEIGHT // 2 - 50))
    screen.blit(reset_img, (WIDTH // 2 - 40, HEIGHT // 2 + 10))

while running:
    screen.fill(WHITE)
    
    # Draw clouds
    for cloud in clouds:
        screen.blit(cloud_img, (cloud[0], cloud[1]))
        cloud[0] -= 2  # Move clouds
        if cloud[0] < -100:
            cloud[0] = random.randint(800, 1600)
            cloud[1] = random.randint(50, 150)
    
    # Draw moving track
    screen.blit(track_img, (track_x, GROUND_HEIGHT))
    screen.blit(track_img, (track_x + WIDTH, GROUND_HEIGHT))
    track_x -= 10  # Increased track speed
    if track_x <= -WIDTH:
        track_x = 0  # Reset track position
    
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_SPACE:
                dino.jump()
        if event.type == pygame.MOUSEBUTTONDOWN:
            if WIDTH // 2 - 40 <= event.pos[0] <= WIDTH // 2 + 40 and HEIGHT // 2 + 10 <= event.pos[1] <= HEIGHT // 2 + 50:
                reset_game()
    
    dino.update()
    dino.draw()
    
    # Spawn obstacles more frequently (increase spawn rate)
    if random.randint(1, 30) == 1:  # Increased chance for spawning an obstacle
        obstacles.append(Obstacle())  # Spawn obstacle occasionally
    
    for obstacle in obstacles[:]:
        obstacle.update()
        obstacle.draw()
        if obstacle.off_screen():
            obstacles.remove(obstacle)
            score += 1
        if obstacle.collision(dino):
            draw_game_over()
            pygame.display.flip()
            pygame.time.delay(2000)
            running = False  # End game
    
    # Display score
    score_text = pygame.font.Font(None, 36).render(f"Score: {score}", True, BLACK)
    screen.blit(score_text, (10, 10))
    
    # Gradually increase difficulty
    if score % 5 == 0:
        for obstacle in obstacles:
            obstacle.speed += 1  # Increase obstacle speed gradually
    
    pygame.display.flip()
    clock.tick(10)

pygame.quit()
