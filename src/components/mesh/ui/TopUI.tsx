import Footer from "./Footer";
import LoadingText from "./LoadingText";
import DrawOutline from "./Outline";


export default function TopUI() {

    return (
        <>
            <DrawOutline />
            <div className="absolute left-[26px] top-5 text-white opacity-90 tracking-widest flex">
                <div className="">
                    <div>COSMIC</div>
                    <div className="mt-[-8px]">SYNTAX</div>
                </div>
                <div className="text-[10px] tracking-normal p-1">
                    <LoadingText text="by Junsang Yoon" />
                </div>
            </div>
            <Footer />
        </>
    )

}