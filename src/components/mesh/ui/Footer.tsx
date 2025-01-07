import MusicPlayer from "./MusicPlayer";


export default function Footer() {
    const clipPathStyles = {
        clipPath: "polygon(0px 0, 100% 0px, 100% 100%, 0 100%)",
    }

    const diagLineRightStyles = {
        borderTop: "3px solid #7dd3fc",
        // transform: "translate(-23px,-1px) rotate(-64deg)",
        transform: "rotate(-64deg)",
        transformOrigin: "100% 0",
        boxShadow: "0 0 2px 2px skyblue",
    }


    const diagLineLeftStyles = {
        borderTop: "3px solid #7dd3fc",
        // transform: "translate(-23px,-1px) rotate(-64deg)",
        transform: "rotate(64deg)",
        transformOrigin: "0 0",
        boxShadow: "0 0 2px 2px skyblue",
    }

    const barTextShadow = {
        textShadow: "0 0 2px white"
    }


    return (
        <>
            <MusicPlayer />

            {/* footer */}
            <div style={clipPathStyles} className="h-[25px] w-full absolute border-t border-sky-300 bg-sky-50 bg-opacity-15 left-0 bottom-0 flex justify-between">
                {/* LEFT */}
                <div className="h-6 flex justify-start text-white text-xs font-thin">
                    <div className="w-2"></div>

                    {/* ITEM 1 */}
                    <div className="w-24 flex items-center justify-center pr-2 ">
                        <div style={barTextShadow}>Music Player</div>
                    </div>
                    <div className="w-[25px]"><div style={diagLineLeftStyles}></div></div>

                    {/* ITEM 2 */}
                    <div className="w-[86px] flex items-center justify-center pr-3">
                        <div>Mode Select</div>
                    </div>
                    <div className="w-[25px]"><div style={diagLineLeftStyles}></div></div>

                    {/* ITEM 3 */}
                    <div className="w-20 flex items-center justify-center pr-3">
                        <div>Options</div>
                    </div>
                    <div className="w-[25px]"><div style={diagLineLeftStyles}></div></div>
                </div>

                {/* RIGHT */}
                <div className="h-6 w-60 flex">
                    <div className="w-[25px]">
                        <div style={diagLineRightStyles}></div>
                    </div>
                    <div className="flex-1 text-white text-[8px] font-thin flex flex-col justify-center items-end pr-2">
                        <div>Copyright © 2024 Junsang Yoon. All Rights Reserved.</div>
                    </div>

                </div>

            </div>

            {/* copyright part
            <div style={clipPathRightStyles} className="h-6 w-64 absolute bg-sky-50 bg-opacity-10 right-0 bottom-0 flex">
                
            </div> */}
        </>
    );
}
