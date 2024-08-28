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
        console.log("url = ", url)
        location.href = url
    }

    logout() {
        location.href = this.logoutRoute
    }

    async isConnected() {
        try {
            const response = await fetch('/ldviz/is-connected', {
                method: 'GET',
                cache: 'no-cache'
            })
    
            if (response.ok) {
                return true // there is a user connected
            } else {
                return false // no user is connected
            }
        } catch (e) {
            console.error("Error checking connection to the website:", e);
            alert("No connection to the website. Please check your internet connection or try again later.");
            return false;
        }
    }

    async setLoginButton() {
        let loginButton = document.querySelector("#login")
        if (await this.isConnected()) {
            loginButton.textContent = 'Logout'
            loginButton.href = '/ldviz/logout'
        } else {
            loginButton.textContent = 'Login'
            loginButton.href = '/ldviz/login'
        }
    }
}   