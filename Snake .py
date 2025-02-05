import pygame
import random

# Initialize pygame
pygame.init()

# Screen dimensions
WIDTH, HEIGHT = 600, 400
BLOCK_SIZE = 20  # Size of snake segment

# Colors
BLACK = (0, 0, 0)
GREEN = (0, 255, 0)
RED = (255, 0, 0)
BLUE = (0, 0, 255)
WHITE = (255, 255, 255)

# Set up display
screen = pygame.display.set_mode((0, 0), pygame.FULLSCREEN)
WIDTH, HEIGHT = screen.get_size()
pygame.display.set_caption("Snake Game")

# Fonts
font = pygame.font.Font(None, 36)

# Snake and food initialization
snake = [(100, 100)]  # Initial position
snake_dir = (BLOCK_SIZE, 0)
food = (random.randrange(0, WIDTH, BLOCK_SIZE), random.randrange(0, HEIGHT, BLOCK_SIZE))
score = 0
speed = 70  # Initial speed
game_over = False

# Reset function
def reset_game():
    global snake, snake_dir, food, score, speed, game_over
    snake = [(100, 100)]
    snake_dir = (BLOCK_SIZE, 0)
    food = (random.randrange(0, WIDTH, BLOCK_SIZE), random.randrange(0, HEIGHT, BLOCK_SIZE))
    score = 0
    speed = 100
    game_over = False

# Main game loop
while True:
    screen.fill(BLACK)
    
    # Event handling
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            exit()
        if event.type == pygame.KEYDOWN:
            if event.key in [pygame.K_UP, pygame.K_w] and snake_dir != (0, BLOCK_SIZE):
                snake_dir = (0, -BLOCK_SIZE)
            elif event.key in [pygame.K_DOWN, pygame.K_s] and snake_dir != (0, -BLOCK_SIZE):
                snake_dir = (0, BLOCK_SIZE)
            elif event.key in [pygame.K_LEFT, pygame.K_a] and snake_dir != (BLOCK_SIZE, 0):
                snake_dir = (-BLOCK_SIZE, 0)
            elif event.key in [pygame.K_RIGHT, pygame.K_d] and snake_dir != (-BLOCK_SIZE, 0):
                snake_dir = (BLOCK_SIZE, 0)
        if event.type == pygame.MOUSEBUTTONDOWN and game_over:
            mouse_x, mouse_y = event.pos
            if 250 <= mouse_x <= 350 and 10 <= mouse_y <= 50:
                reset_game()
    
    if not game_over:
        # Move the snake
        new_head = (snake[0][0] + snake_dir[0], snake[0][1] + snake_dir[1])
        
        # Check for collisions
        if new_head in snake or new_head[0] < 0 or new_head[0] >= WIDTH or new_head[1] < 0 or new_head[1] >= HEIGHT:
            game_over = True
        else:
            snake.insert(0, new_head)
            if new_head == food:
                score += 5
                speed = max(20, 50 - (score // 10) * 2)  # Increase speed gradually
                food = (random.randrange(0, WIDTH, BLOCK_SIZE), random.randrange(0, HEIGHT, BLOCK_SIZE))
            else:
                snake.pop()
    
    # Draw snake
    for segment in snake:
        pygame.draw.rect(screen, GREEN, pygame.Rect(segment[0], segment[1], BLOCK_SIZE, BLOCK_SIZE))
    
    # Draw food
    pygame.draw.rect(screen, RED, pygame.Rect(food[0], food[1], BLOCK_SIZE, BLOCK_SIZE))
    
    # Draw score
    score_text = font.render(f"Score: {score}", True, BLUE)
    screen.blit(score_text, (10, 10))
    
    # Draw restart button if game over
    if game_over:
        pygame.draw.rect(screen, BLUE, pygame.Rect(250, 10, 100, 40))
        restart_text = font.render("Restart", True, WHITE)
        screen.blit(restart_text, (260, 15))
    
    pygame.display.flip()
    pygame.time.delay(speed)
