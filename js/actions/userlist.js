actions.userlist = function(data) {
    var card = document.createElement('div');
    card.className = 'userCard';

    var cardName = document.createElement('h2');
    var cardLink = document.createElement('a');
    cardLink.innerText = data.username;
    cardLink.href = '/users/' + data.id;
    cardName.appendChild(cardLink);
    card.appendChild(cardName);

    var cardDesc = document.createElement('p');
    cardDesc.innerText = 'somebody';
    card.appendChild(cardDesc);
    util.mainarea.appendChild(card);
};
