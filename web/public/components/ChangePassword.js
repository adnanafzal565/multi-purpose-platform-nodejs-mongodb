function ChangePassword() {

    const [isSaving, setIsSaving] = React.useState(false)

    async function changePassword() {
        event.preventDefault()

	if (isDemo) {
		swal.fire("Change password", "Password has been changed", "success");
		return;
	}

	try {
            
            setIsSaving(true)

            const formData = new FormData(event.target)
            const response = await axios.post(
                apiUrl + "/change-password",
                formData,
                {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem(accessTokenKey)
                    }
                }
            )

            if (response.data.status == "success") {
                swal.fire("Change password", response.data.message, "success")
            } else {
                swal.fire("Error", response.data.message, "error")
            }
        } catch (exp) {
            swal.fire("Error", exp.message, "error")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <form onSubmit={ changePassword }>
            <div className="form-group">
                <label className="form-label">Current password</label>
                <input type="password" name="password" className="form-control" />
            </div>

            <div className="form-group mt-3 mb-3">
                <label className="form-label">New password</label>
                <input type="password" name="newPassword" className="form-control" />
            </div>

            <div className="form-group mb-3">
                <label className="form-label">Confirm password</label>
                <input type="password" name="confirmPassword" className="form-control" />
            </div>

            <input type="submit" name="submit" className="btn btn-outline-primary btn-sm"
                value={ isSaving ? "Saving..." : "Change" }
                disabled={ isSaving } />
        </form>
    )
}

ReactDOM.createRoot(
    document.getElementById("change-password-app")
).render(<ChangePassword />)
