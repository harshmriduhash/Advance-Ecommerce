export function currencyFormat(num){
    return "Rs. " + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}