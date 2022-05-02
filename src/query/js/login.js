class Auth {
    constructor(user) {
        this.user = user;

        this.loginPage = '/ldviz/login'
        this.logoutRoute = '/ldviz/logout'
    }

    setUser(user) {
        this.user = user;
    }

    login(action) {
        if (action) {
            console.log(window.location)
            let href = window.location.href
            let origin = window.location.origin
            console.log(href, origin)
            href = href.replace(`${origin}/query/${action}`, '')
            location.href = this.loginPage + href + '&action=' + action
        } else 
            location.href = this.loginPage
    }

    logout() {
        location.href = this.logoutRoute
    }

    isConnected() {
        return this.user && this.user.email != null && this.user.email != 'false';
    }

    setLoginButton() {
        if (this.user && this.user.email) {
            let loginButton = document.getElementById('login-button')
            loginButton.innerHTML = 'Sign Out'
            loginButton.onclick = () => this.logout()
            document.getElementById('username').innerHTML = `Welcome ${this.user.name}`
        }
    }
}   