class Auth {
    constructor() {

        this.loginRoute = '/ldviz/login'
        this.logoutRoute = '/ldviz/logout'
        this.sessionId = null

        
    }

    set() {
        this.restoreSessionID()

        this.setForm()

        document.querySelector("#login").addEventListener('click', () => this.handleClick())

        this.setLoginButton()

        
    }

    getQueryParams() {
        // Get the current URL's query string
        const queryString = window.location.search;

        // Parse the query string
        const urlParams = new URLSearchParams(queryString);

        // Access individual query parameters
        return {
            origin: urlParams.get('origin'),
            action: urlParams.get('action'),
            queryId: urlParams.get('queryId')
        } 
    }


    setForm() {
        const loginForm = document.querySelector("#login_form")
        
        if (!loginForm) return

        const _this = this;
        loginForm.addEventListener("submit", async function(e) {
            e.preventDefault()

            const username = document.querySelector('#username').value;
            const password = document.querySelector('#password').value;

            
            let params = _this.getQueryParams()
           
            try {
                let response = await fetch(_this.loginRoute, 
                    { method: "POST", 
                        headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ username: username, password: password }) })
                   

                if (response.ok) {
                    let data = await response.json()
                  
                    _this.setSessionID(data.sessionId)

                    let origin = params.origin ? `${params.origin}/` : ""
                    let action = params.action || ""
                    let queryId = params.queryId ? `?queryId=${params.queryId}` : ""
                    let url = `/ldviz/${origin}${action}${queryId}`
                  
                    location.href = url

                } else {
                    document.querySelector("#error-message").textContent = response.message
                }
            } catch(e) {
                // Handle client-side or network errors (e.g., network down, CORS issues)
                console.error("Network or fetch error:", e.message);
                document.querySelector("#error-message").textContent = "A network error occurred. Please check your internet connection and try again.";
            }
        })
    }

    setSessionID(sessionID) {
        this.sessionId = sessionID
        window.sessionStorage.setItem('sessionID', this.sessionId)
    }

    restoreSessionID() {
        this.sessionId = window.sessionStorage.sessionID
    }

    loadLoginPage(origin, action, query) {
        let url = `${this.loginRoute}?origin=${origin}`
        
        if (action && !['delete', 'publish'].includes(action)) {
            url += '&action=' + action
            if (query) 
                url += '&queryId=' + query.id 
        } 
       
        location.href = url
    }

    async logout() {
        try {
            let response = await fetch(this.logoutRoute, 
                { method: "POST", 
                    headers: {'Content-Type': 'application/json'} })
                
            if (response.ok) {
                this.sessionId = null
                window.sessionStorage.removeItem("sessionID")
                this.setLoginButton()

                const pathname = window.location.pathname
                let parts = pathname.split('/')
                let action = parts[parts.length - 1] // get the last part
               
                if (action && ['edit', 'newQuery'].includes(action)) {
                    location.href = '/ldviz/editor'
                }
            } else {
                alert("Something went wrong. Please check your internet connection and try again.")
            }
        } catch(e) {
            // Handle client-side or network errors (e.g., network down, CORS issues)
            console.error("Network or fetch error:", e.message);
            alert("A network error occurred. Please check your internet connection and try again.")
        }
    }

    handleClick() {
        if (this.sessionId) {
            this.logout()
        } else location.href = this.loginRoute
    }

    isConnected() {
        return this.sessionId && this.sessionId !== 'null'
    }

    async setLoginButton() {
        document.querySelector("#login").textContent = this.isConnected() ? "Logout" : "Login"
    }
}   