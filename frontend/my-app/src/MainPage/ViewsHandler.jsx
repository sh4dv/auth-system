
function ViewsHandler({ viewState, setViewState }) {

    return (
        <div className="buttons-view">
            <button className={viewState === 'my-licenses' ? 'active views-btn' : 'views-btn'} onClick={() => setViewState('my-licenses')}>My Licenses</button>
            <button className={viewState === 'generate-license' ? 'active views-btn' : 'views-btn'} onClick={() => setViewState('generate-license')}>Generate License</button>
            <button className={viewState === 'delete-license' ? 'active views-btn' : 'views-btn'} onClick={() => setViewState('delete-license')}>Delete License</button>
            <button className={viewState === 'check-license' ? 'active views-btn' : 'views-btn'} onClick={() => setViewState('check-license')}>Check Licenses</button>
            <button className={viewState === 'integrate-system' ? 'active views-btn' : 'views-btn'} onClick={() => setViewState('integrate-system')}>Integrate System</button>
        </div>
    );
}

export default ViewsHandler;