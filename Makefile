.PHONY: all

all: scss/chat.scss
	scss scss/chat-light.scss css/chat-light.css --style compressed
	scss scss/chat-dark.scss css/chat-dark.css --style compressed
