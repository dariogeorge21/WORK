import pygame
import sys

# Initialize pygame
pygame.init()

# Constants
WIDTH, HEIGHT = 1000, 800  # Extended width for scoreboard
LINE_WIDTH = 15
BOARD_ROWS, BOARD_COLS = 3, 3
SQUARE_SIZE = HEIGHT // BOARD_COLS
CIRCLE_RADIUS = SQUARE_SIZE // 3
CIRCLE_WIDTH = 15
CROSS_WIDTH = 25
SPACE = SQUARE_SIZE // 4
BG_COLOR = (28, 170, 156)
LINE_COLOR = (23, 145, 135)
CIRCLE_COLOR = (239, 231, 200)
CROSS_COLOR = (66, 66, 66)
TEXT_COLOR = (255, 255, 255)
FONT = pygame.font.Font(None, 60)
BUTTON_FONT = pygame.font.Font(None, 40)

# Load sounds
# x_sound = pygame.mixer.Sound("x_sound.wav")
# o_sound = pygame.mixer.Sound("o_sound.wav")

# Set up the display in full-screen mode
screen = pygame.display.set_mode((WIDTH, HEIGHT), pygame.FULLSCREEN)
pygame.display.set_caption("Tic-Tac-Toe")

# Initialize reset delay
reset_delay = 2000  # Initial reset delay of 2 seconds

# Score variables
score_x = 0
score_o = 0
next_start = 'X'  # Track who starts next

# Draw grid lines
def draw_lines():
    screen.fill(BG_COLOR)
    for i in range(1, BOARD_ROWS):
        pygame.draw.line(screen, LINE_COLOR, (0, i * SQUARE_SIZE), (HEIGHT, i * SQUARE_SIZE), LINE_WIDTH)
        pygame.draw.line(screen, LINE_COLOR, (i * SQUARE_SIZE, 0), (i * SQUARE_SIZE, HEIGHT), LINE_WIDTH)

def draw_scoreboard():
    score_text_x = FONT.render(f"X: {score_x}", True, TEXT_COLOR)
    score_text_o = FONT.render(f"O: {score_o}", True, TEXT_COLOR)
    reset_button = BUTTON_FONT.render("Reset Score", True, TEXT_COLOR)
    screen.blit(score_text_x, (HEIGHT + 50, 100))
    screen.blit(score_text_o, (HEIGHT + 50, 200))
    pygame.draw.rect(screen, LINE_COLOR, (HEIGHT + 50, 300, 200, 50))
    screen.blit(reset_button, (HEIGHT + 70, 310))

def reset_board():
    global board, player, game_over, reset_delay, next_start
    board = [[None] * BOARD_COLS for _ in range(BOARD_ROWS)]
    player = next_start  # Alternate starting player
    next_start = 'O' if next_start == 'X' else 'X'
    game_over = False
    reset_delay = max(reset_delay - 200, 500)  # Reduce reset time gradually but not below 500ms
    draw_lines()
    draw_scoreboard()

draw_lines()
reset_board()

# Draw X and O
def draw_figures():
    for row in range(BOARD_ROWS):
        for col in range(BOARD_COLS):
            if board[row][col] == 'O':
                pygame.draw.circle(screen, CIRCLE_COLOR, (col * SQUARE_SIZE + SQUARE_SIZE // 2, row * SQUARE_SIZE + SQUARE_SIZE // 2), CIRCLE_RADIUS, CIRCLE_WIDTH)
            elif board[row][col] == 'X':
                pygame.draw.line(screen, CROSS_COLOR, (col * SQUARE_SIZE + SPACE, row * SQUARE_SIZE + SPACE), (col * SQUARE_SIZE + SQUARE_SIZE - SPACE, row * SQUARE_SIZE + SQUARE_SIZE - SPACE), CROSS_WIDTH)
                pygame.draw.line(screen, CROSS_COLOR, (col * SQUARE_SIZE + SQUARE_SIZE - SPACE, row * SQUARE_SIZE + SPACE), (col * SQUARE_SIZE + SPACE, row * SQUARE_SIZE + SQUARE_SIZE - SPACE), CROSS_WIDTH)

# Check for win conditions
def check_winner(player):
    for row in range(BOARD_ROWS):
        if all(board[row][col] == player for col in range(BOARD_COLS)):
            return True
    for col in range(BOARD_COLS):
        if all(board[row][col] == player for row in range(BOARD_ROWS)):
            return True
    if all(board[i][i] == player for i in range(BOARD_ROWS)) or all(board[i][BOARD_COLS - i - 1] == player for i in range(BOARD_ROWS)):
        return True
    return False

# Check for a tie
def check_tie():
    return all(all(cell is not None for cell in row) for row in board)

# Display winner or tie and restart game
def display_message(message, winner=None):
    global score_x, score_o
    screen.fill(BG_COLOR)
    text = FONT.render(message, True, TEXT_COLOR)
    text_rect = text.get_rect(center=(HEIGHT // 2, HEIGHT // 2))
    screen.blit(text, text_rect)
    pygame.display.update()
    pygame.time.delay(reset_delay)
    if winner == 'X':
        score_x += 1
    elif winner == 'O':
        score_o += 1
    reset_board()

# Game loop variables
player = 'X'
game_over = False

# Main game loop
while True:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()
        if event.type == pygame.MOUSEBUTTONDOWN and not game_over:
            x, y = event.pos
            if HEIGHT + 50 <= x <= HEIGHT + 250 and 300 <= y <= 350:  # Reset button clicked
                score_x = 0
                score_o = 0
                next_start = 'X'  # Ensure X starts after a full reset
                reset_board()
                continue
            row, col = y // SQUARE_SIZE, x // SQUARE_SIZE
            if row < BOARD_ROWS and col < BOARD_COLS and board[row][col] is None:
                board[row][col] = player
                draw_figures()
                # if player == 'X':
                #     x_sound.play()
                # else:
                #     o_sound.play()
                if check_winner(player):
                    display_message(f"Player {player} Wins!", player)
                elif check_tie():
                    display_message("It's a Tie!")
                else:
                    player = 'O' if player == 'X' else 'X'
    pygame.display.update()
