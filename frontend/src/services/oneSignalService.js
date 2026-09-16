let oneSignalInitPromise = null;

export function initializeOneSignal() {

    if (oneSignalInitPromise) {
        console.log("OneSignal initialization already started");
        return oneSignalInitPromise;
    }


    oneSignalInitPromise = new Promise((resolve, reject) => {

        window.OneSignalDeferred =
            window.OneSignalDeferred || [];


        window.OneSignalDeferred.push(
            async function (OneSignal) {

                try {

                    await OneSignal.init({
                        appId: "014d2894-38a9-4cad-ba58-ddb43cadc6b3",
                    });


                    console.log(
                        "OneSignal initialized"
                    );


                    resolve(OneSignal);

                } catch(error) {

                    console.error(
                        "OneSignal initialization failed",
                        error
                    );

                    reject(error);
                }
            }
        );

    });


    return oneSignalInitPromise;
}