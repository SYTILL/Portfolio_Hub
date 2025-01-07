interface OutlineProps {
    length: number,
    width?: number,
    offset: number,
    isVertical?: boolean,
}

function Outline({ length, width = 1, offset, isVertical = true }: OutlineProps) {
    const margin = 16;

    const lineStyle: React.CSSProperties = {
        position: "absolute",
        width: isVertical ? `${width}px` : `${length}px`,
        height: isVertical ? `${length}px` : `${width}px`,
        left: isVertical ? `${margin}px` : `${offset+margin}px`,
        top: isVertical ? `${offset+margin}px` : `${margin}px`,
        background: '#7dd3fc',
        boxShadow: "0 0 2px 1px skyblue",
    };

    return <div style={lineStyle}></div>;
};

export default function DrawOutline(){

    return (
        <>
            {/* dot=1 line=6 dotspace=4 letterspace=10 */}
            {/* .--- ..- -. ... .- -. --. */}
            <Outline offset={0} length={32}  />
            <Outline offset={32+16} length={1} />
            <Outline offset={32+16+1+4} length={6} />
            <Outline offset={32+16+1+4+6+4} length={6} />
            <Outline offset={32+16+1+4+6+4+6+4} length={6} />
            <Outline offset={32+16+1+4+6+4+6+4+6+10} length={1} />
            <Outline offset={32+16+1+4+6+4+6+4+6+10+1+4} length={1} />
            <Outline offset={32+16+1+4+6+4+6+4+6+10+1+4+1+4} length={6} />
            <Outline offset={32+16+1+4+6+4+6+4+6+10+1+4+1+4+6+10} length={6} />
            <Outline offset={32+16+1+4+6+4+6+4+6+10+1+4+1+4+6+10+6+4} length={1} />
            <Outline offset={32+16+1+4+6+4+6+4+6+10+1+4+1+4+6+10+6+4+1+10} length={1} />
            <Outline offset={32+16+1+4+6+4+6+4+6+10+1+4+1+4+6+10+6+4+1+10+5} length={1} />
            <Outline offset={32+16+1+4+6+4+6+4+6+10+1+4+1+4+6+10+6+4+1+10+10} length={1} />
            <Outline offset={32+16+1+4+6+4+6+4+6+10+1+4+1+4+6+10+6+4+1+10+10+11} length={1} />
            <Outline offset={32+16+1+4+6+4+6+4+6+10+1+4+1+4+6+10+6+4+1+10+10+11+5} length={6} />
            <Outline offset={32+16+1+4+6+4+6+4+6+10+1+4+1+4+6+10+6+4+1+10+10+11+5+16} length={6} />
            <Outline offset={32+16+1+4+6+4+6+4+6+10+1+4+1+4+6+10+6+4+1+10+10+11+5+16+4+6} length={1} />
            <Outline offset={32+16+1+4+6+4+6+4+6+10+1+4+1+4+6+10+6+4+1+10+10+11+5+16+4+6+11} length={6} />
            <Outline offset={32+16+1+4+6+4+6+4+6+10+1+4+1+4+6+10+6+4+1+10+10+11+5+16+4+6+11+10} length={6} />
            <Outline offset={32+16+1+4+6+4+6+4+6+10+1+4+1+4+6+10+6+4+1+10+10+11+5+16+4+6+11+10+10} length={1} />

            {/* -.-- --- --- -. */}
            <Outline isVertical={false} offset={0} length={64} />
            <Outline isVertical={false} offset={64+16} length={6} />
            <Outline isVertical={false} offset={64+16+10} length={1} />
            <Outline isVertical={false} offset={64+16+10+5} length={6} />
            <Outline isVertical={false} offset={64+16+10+5+10} length={6} />
            <Outline isVertical={false} offset={64+16+10+5+10+16} length={6} />
            <Outline isVertical={false} offset={64+16+10+5+10+16+10} length={6} />
            <Outline isVertical={false} offset={64+16+10+5+10+16+10+10} length={6} />
            <Outline isVertical={false} offset={64+16+10+5+10+16+10+10+16} length={6} />
            <Outline isVertical={false} offset={64+16+10+5+10+16+10+10+16+10} length={6} />
            <Outline isVertical={false} offset={64+16+10+5+10+16+10+10+16+10+10} length={6} />
            <Outline isVertical={false} offset={64+16+10+5+10+16+10+10+16+10+10+16} length={6} />
            <Outline isVertical={false} offset={64+16+10+5+10+16+10+10+16+10+10+16+10} length={1} />
        </>
    )

}