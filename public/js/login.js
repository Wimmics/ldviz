class Auth {
    constructor(user) {
        this.user = user;

        this.loginPage = '/ldviz/login'
        this.logoutRoute = '/ldviz/logout'

        // document.querySelector("#login").addEventListener("click", () => this.login())
    }

    setUser(user) {
        this.user = user;
    }

    login(origin, action, query) {
        let url = `${this.loginPage}?origin=${origin}`
        
        if (action && !['delete', 'publish'].includes(action)) {
            location.href = url + '&action=' + action + '&queryId=' + query.id 
        } else 
            location.href = url
    }

    logout() {
        location.href = this.logoutRoute
    }

    isConnected() {
        return this.user && this.user.email != null && this.user.email != 'false';
    }

    setLoginButton() {
        let loginButton = document.querySelector("#login")
        if (this.user && this.user.email) {
            loginButton.textContent = 'Logout'
            loginButton.href = '/ldviz/logout'
        } else {
            loginButton.textContent = 'Login'
            loginButton.href = '/ldviz/login'
        }
    }
}   