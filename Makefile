.PHONY: all

all: scss/chat.scss
	scss scss/chat-light.scss css/chat-light.css --style compressed
	scss scss/chat-dark.scss css/chat-dark.css --style compressed
	scss scss/rooms-light.scss css/rooms-light.css --style compressed
	scss scss/rooms-dark.scss css/rooms-dark.css --style compressed
	scss scss/users-light.scss css/users-light.css --style compressed
	scss scss/users-dark.scss css/users-dark.css --style compressed
