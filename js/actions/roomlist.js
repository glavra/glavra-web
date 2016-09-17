actions.roomlist = function(data) {
    var card = document.createElement('div');
    card.className = 'roomCard';

    var cardName = document.createElement('h2');
    var cardLink = document.createElement('a');
    cardLink.innerText = data.name;
    cardLink.href = '/chat/' + data.id;
    cardName.appendChild(cardLink);
    card.appendChild(cardName);

    var cardDesc = document.createElement('p');
    cardDesc.innerText = data.desc;
    card.appendChild(cardDesc);
    util.mainarea.appendChild(card);
};
