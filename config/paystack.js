const paystack = (request) => {
    const MySecretKey = 'Bearer sk_test_6cf8802f1d7eea77e1a4683b0e4ef8811ac07e36';
    // sk_test_3660489b1d932eb510f83ea831a34ff71e0cd7a0
    // pk_test_00b5e630a3330d2be8f20d18f34f273b87a48caa
    // sk_test_6cf8802f1d7eea77e1a4683b0e4ef8811ac07e36


    //replace the secret key with that from your paystack account
    const initializePayment = (form, mycallback) => {
        const options = {
            url: 'https://api.paystack.co/transaction/initialize',
            headers: {
                authorization: MySecretKey,
                'content-type': 'application/json',
                'cache-control': 'no-cache'
            },
            form
        }
        const callback = (error, response, body) => {
            return mycallback(error, body)
        }
        request.post(options, callback)
    }

    const verifyPayment = (ref, mycallback) => {
        const options = {
            url: 'https://api.paystack.co/transaction/verify/' + encodeURIComponent(ref),
            headers: {
                authorization: MySecretKey,
                'content-type': 'application/json',
                'cache-control': 'no-cache'
            }
        }
        const callback = (error, response, body) => {
            return mycallback(error, body)
        }
        request(options, callback)
    }

    return { initializePayment, verifyPayment };
}

module.exports = paystack;