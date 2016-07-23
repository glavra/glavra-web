.PHONY: all

all: scss/chat.scss
	scss scss/chat.scss css/chat.css --style compressed
	scss scss/chat-dark.scss css/chat-dark.css --style compressed
