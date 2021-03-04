import React from 'react'

const Notification = ({ notification }) => {
    if (notification === null) {
        return null
    }

    const className = notification.type === 'success' ? 'successful' : 'error'
    return (
        <div className={className}>
            {notification.message}
        </div>
    )
}

export default Notification