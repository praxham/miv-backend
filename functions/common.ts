export const generateOTP = () => {
    let digits = '0123456789';
    let OTP = '';
    let len = digits.length;
    for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random()*len)];
    }
    return OTP;
}

export const generateResponse = () => {
    
}

// export const parseNumbersToDevnagri = () => {
//     const map = {0: ०,1:१,2:२,3:३,4:४,5:५,6:६,7:७,8:८,9:९}
// }