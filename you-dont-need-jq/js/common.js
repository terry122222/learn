(function() {
    var doc = document;
    var list = doc.querySelector('.list'),
        hello = doc.querySelector('.hello'),
        secondLi = list.querySelector('.second');

    console.log(list.nextElementSibling);
})();
