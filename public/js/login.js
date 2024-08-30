class Auth {
    constructor() {

        this.loginPage = '/ldviz/login'
        this.logoutRoute = '/ldviz/logout'

    }

    login(origin, action, query) {
        let url = `${this.loginPage}?origin=${origin}`
        
        if (action && !['delete', 'publish'].includes(action)) {
            url += '&action=' + action
            if (query) 
                url += '&queryId=' + query.id 
        } 
       
        location.href = url
    }

    logout() {
        location.href = this.logoutRoute
    }

    isConnected() {

        return window.sessionStorage.sessionID !== 'null'
        // try {
        //     const response = await fetch('/ldviz/is-connected', {
        //         method: 'GET',
        //         cache: 'no-cache'
        //     })
    
        //     if (response.ok) {
        //         let data = await response.json()
        //         return window.sessionStorage.sessionID === data.sessionID
        //     } else {
        //         return false // no user is connected
        //     }
        // } catch (e) {
        //     console.error("Error checking connection to the website:", e);
        //     alert("No connection to the website. Please check your internet connection or try again later.");
        //     return false;
        // }
    }

    async setLoginButton() {
        let loginButton = document.querySelector("#login")

        if (this.isConnected()) {
            loginButton.textContent = 'Logout'
            loginButton.href = this.logoutRoute
        } else {
            loginButton.textContent = 'Login'
            loginButton.href = this.loginPage
        }
    }
}   