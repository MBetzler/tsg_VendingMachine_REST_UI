$(document).ready(function () {

    loadItems();

    clearTotalMoney();

    $('#makePurchase').click(function (event) {

        if ($('#itemSelection').val() == '') {
            $('#vendingMessages').val('You must first select an item.');
            clearVendingChange();
            return false;
        } else if (Number($('#totalMoney').val()).toFixed(2) == 0) {
            $('#vendingMessages').val('You must first insert money.');
            return false;
        }

        $.ajax({
            type: 'GET',
            url: 'http://localhost:8080/money/' + Number($('#totalMoney').val()).toFixed(2) + '/item/' + $('#itemSelection').val(),
            success: function (data, status) {
                var quarters = data.quarters;
                var dimes = data.dimes;
                var nickels = data.nickels;
                var pennies = data.pennies;

                $('#vendingChange').val(buildChangeText(quarters, dimes, nickels, pennies));
                $('#vendingMessages').val('Thank You!!!');
                clearTotalMoney();
                clearItemSelection();
                clearItems();
                loadItems();
            },
            error: function (response) {
                response = $.parseJSON(response.responseText).message;

                if (response.substring(0, 16) == "Please deposit: ") {
                    response = response.substring(0, 16) + '$' + response.substring(16);
                }

                $('#vendingMessages').val(response);
            }
        });
    });

    $('#returnChange').click(function (event) {
        var totalMoney;
        var quarters;
        var dimes;
        var nickels;
        var pennies;

        totalMoney = $('#totalMoney').val();

        if (totalMoney > 0) {

            quarters = parseInt(totalMoney / 0.25);
            totalMoney = (totalMoney % 0.25).toFixed(2);
            dimes = parseInt(totalMoney / 0.1);
            totalMoney = (totalMoney % 0.1).toFixed(2);
            nickels = parseInt(totalMoney / 0.05);
            totalMoney = (totalMoney % 0.05).toFixed(2);
            pennies = parseInt(totalMoney / 0.01);

            $('#vendingChange').val(buildChangeText(quarters, dimes, nickels, pennies));
            clearTotalMoney();
            clearItemSelection();
            $('#vendingMessages').val('Please collect your change.');
        } else {
            $('#vendingMessages').val('There\'s no change to dispense.');
            clearVendingChange();
        }
    });

});

function loadItems() {

    var itemContainer = $('#itemContainer');

    $.ajax({
        type: 'GET',
        url: 'http://localhost:8080/items',
        success: function (data, status) {
            var rowCount = 1;
            var itemCount = 0;

            $.each(data, function (index, item) {
                var itemId = item.id;
                var itemName = item.name;
                var itemPrice = '$' + item.price.toFixed(2);
                var itemQuantity = item.quantity;

                if (itemCount == 0) {
                    itemContainer.append($('<div>')
                        .attr({ class: 'row', id: 'itemRow' + rowCount }))
                }

                itemCount++;

                var itemColumn = $('<div>')
                    .attr({ class: 'col-lg item', id: 'itemId' + itemId, onclick: 'setItemSelection(' + itemId + ')' })
                    .append($('<p>')
                        .text(itemId))
                    .append($('<p>')
                        .attr({ style: 'text-align: center;' })
                        .text(itemName))
                    .append($('<p>')
                        .attr({ style: 'text-align: center;' })
                        .text(itemPrice))
                    .append($('<p>')
                        .attr({ style: 'text-align: center;' })
                        .text("Quantity Left: ")
                        .append($('<span>')
                            .text(itemQuantity)))

                $('#itemRow' + rowCount).append(itemColumn);

                if (itemCount == 3) {
                    itemCount = 0;
                    rowCount++;
                }
            });
        },
        error: function () {
            $('#serviceStatus')
                .append($('<li>')
                    .attr({ class: 'list-group-item list-group-item-danger', style: 'width: 92.5%; margin: auto;' })
                    .text('Error calling Vending web service.  Please try again later.'));
        }
    });
}

function clearItems() {
    $('#itemContainer').empty();
}

function clearTotalMoney() {
    $('#totalMoney').val('0.00');
}

function clearVendingChange() {
    $('#vendingChange').val('');
}

function clearItemSelection() {
    $('#itemSelection').val('');
}

function clearVendingMessages() {
    $('#vendingMessages').val('');
}

function setItemSelection(itemId) {
    $('#itemSelection').val(itemId)
    clearVendingChange();
    clearVendingMessages();
}

function addMoney(amount) {
    $('#totalMoney').val((Number($('#totalMoney').val()) + Number(amount)).toFixed(2));
    clearVendingMessages();
}

function buildChangeText(quarters, dimes, nickels, pennies) {
    var change = '';

    if (quarters > 0) {
        if (quarters == 1) {
            change += "1 quarter";
        } else {
            change += quarters + " quarters";
        }
    }

    if (dimes > 0) {
        if (change.length > 0) {
            change += ", ";
        }
        if (dimes == 1) {
            change += "1 dime";
        } else {
            change += dimes + " dimes";
        }
    }

    if (nickels > 0) {
        if (change.length > 0) {
            change += ", ";
        }
        if (nickels == 1) {
            change += "1 nickel";
        } else {
            change += nickels + " nickels";
        }
    }

    if (pennies > 0) {
        if (change.length > 0) {
            change += ", ";
        }
        if (pennies == 1) {
            change += "1 penny";
        } else {
            change += pennies + " pennies";
        }
    }

    return change;
}