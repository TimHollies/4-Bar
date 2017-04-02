
module.exports = ({
    title,
    selectedTransposition,
    showingTranspositionDropdown,
    playing,
    quickUrl,
    errors,
    lastRenderTime
}) => (

    <section class="page-view" id="view-editor">
        <div class="header row" intro='fade' on-mouseup="app_mouseup">

            <div class="back-button" on-click="navigate_back">
                <p><i class="fa fa-chevron-left"></i></p>
            </div>
            <div class="central-menu">
                <h3 class="tune-title">{title}</h3>
                <br />
                <div id="menuButtons"></div>
            </div>
        </div>
        <div class="row toolbar" intro='fade'>
            <div class="toolbar-item">

                <div class="dropdown-selected-value" on-click="show-transposition-menu"><span class="selected-span">{selectedTransposition}</span><span class="arrow-span"><i class="fa fa-arrow-down"></i></span></div>

                {showingTranspositionDropdown ? (
                <table class="table-to-dropdown">
                    <tr><td class="dropdown-icon"></td><td class="dropdown-option" on-click="selectTransposition" val="-7">-7 Semitones</td></tr>
                    <tr><td class="dropdown-icon"></td><td class="dropdown-option" on-click="selectTransposition" val="-6">-6 Semitones</td></tr>
                    <tr><td class="dropdown-icon"><i class="fa fa-minus"></i> <i class="fa fa-minus"></i></td><td class="dropdown-option" on-click="selectTransposition" val="-5">-5 Semitone</td></tr>
                    <tr><td class="dropdown-icon"></td><td class="dropdown-option" on-click="selectTransposition" val="-4">-4 Semitones</td></tr>
                    <tr><td class="dropdown-icon"></td><td class="dropdown-option" on-click="selectTransposition" val="-3">-3 Semitones</td></tr>
                    <tr><td class="dropdown-icon"><i class="fa fa-minus"></i></td><td class="dropdown-option" on-click="selectTransposition" val="-2">-2 Semitones</td></tr>
                    <tr><td class="dropdown-icon"></td><td class="dropdown-option" on-click="selectTransposition" val="-1">-1 Semitones</td></tr>
                    <tr><td class="dropdown-icon"><i class="fa fa-circle"></i></td><td class="dropdown-option" on-click="selectTransposition" val="0">No Tranposition</td></tr>
                    <tr><td class="dropdown-icon"></td><td class="dropdown-option" on-click="selectTransposition" val="1">+1 Semitone</td></tr>
                    <tr><td class="dropdown-icon"><i class="fa fa-plus"></i></td><td class="dropdown-option" on-click="selectTransposition" val="2">+2 Semitones</td></tr>
                    <tr><td class="dropdown-icon"></td><td class="dropdown-option" on-click="selectTransposition" val="3">+3 Semitones</td></tr>
                    <tr><td class="dropdown-icon"></td><td class="dropdown-option" on-click="selectTransposition" val="4">+4 Semitones</td></tr>
                    <tr><td class="dropdown-icon"><i class="fa fa-plus"></i> <i class="fa fa-plus"></i></td><td class="dropdown-option" on-click="selectTransposition" val="5">+5 Semitones</td></tr>
                    <tr><td class="dropdown-icon"></td><td class="dropdown-option" on-click="selectTransposition" val="6">+6 Semitones</td></tr>
                    <tr><td class="dropdown-icon"></td><td class="dropdown-option" on-click="selectTransposition" val="7">+7 Semitones</td></tr>
                </table>
                ) : null }

            </div>
            <div class="toolbar-item">
                {playing ? 
                    (<i on-click="toggle-stop-tune" class="fa fa-stop" style="cursor: pointer"></i>)
                :
                    (<i on-click="toggle-play-tune" class="fa fa-play" style="cursor: pointer"></i>)
                }   
            </div>
        </div>
        <div class="row editor" intro='fade' id="editor-section">
            <dialog id="window">
                <h3>URL</h3>
                <p style="width: 480px;word-break: break-all;">{quickUrl}</p>
                <button on-click="share_url_modal_close">Done</button>
            </dialog>
            <div class="column" id="abc-container">
                <div class="abc-editor">
                    <textarea id="abc"></textarea>
                </div>
                <div class="abc-log">
                    {errors.length > 0 ? (
                    <table>
                        <thead>
                            <th></th>
                            <th>Line</th>
                            <th>Message</th>
                        </thead>
                        <tbody>
                            {errors.map((err, i) => (
                                <tr>
                                    <td class="centered-column">
                                        {err.severity === 1 ? (
                                             <i class="fa fa-times-circle" style="color:red"></i>
                                        ) : (
                                            <i class="fa fa-exclamation-triangle" style="color:orange"></i>
                                        )}
                                    </td>
                                    <td class="centered-column">{err.line + 1}</td>
                                    <td>{{message}}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>) : (<p class="all-is-well-box">No errors detected :D</p>)      }         
                </div>
                <div class="stats">
                    <small>Last Render: {lastRenderTime}ms</small>
                </div>
            </div>
            <div class="column" id="canvas">        
            </div>
        </div>
    </section>
);