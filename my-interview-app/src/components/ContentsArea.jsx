import { Outlet } from 'react-router-dom'

const ContentsArea = () => {
    return (
        <main id="contentsArea">
            <Outlet />
        </main>
    )
}

export default ContentsArea;