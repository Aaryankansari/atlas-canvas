import {
  BaseBoxShapeUtil,
  HTMLContainer,
  RecordProps,
  T,
  TLResizeInfo,
  resizeBox,
} from "tldraw";
import { IntelNodeShape } from "./types";
import { IntelNodeComponent } from "./IntelNodeComponent";

export class IntelNodeShapeUtil extends BaseBoxShapeUtil<IntelNodeShape> {
  static override type = "intel-node" as const;

  static override props: RecordProps<IntelNodeShape> = {
    w: T.number,
    h: T.number,
    label: T.string,
    entityType: T.string as any,
    riskLevel: T.string as any,
    summary: T.string,
    confidence: T.string as any,
    metadata: T.jsonValue as any,
    categories: T.jsonValue as any,
    evidenceLinks: T.arrayOf(T.string) as any,
    aiBio: T.string,
    rawResults: T.jsonValue as any,
  };

  override canEdit() {
    return false;
  }

  override canResize() {
    return true;
  }

  override isAspectRatioLocked() {
    return false;
  }

  getDefaultProps(): IntelNodeShape["props"] {
    return {
      w: 280,
      h: 170,
      label: "Unknown Entity",
      entityType: "general",
      riskLevel: "low",
      summary: "",
      confidence: "medium",
      metadata: { emails: [], ips: [], btcWallets: [], usernames: [], domains: [] },
      categories: { aliases: [], locations: [], financials: [], socials: [] },
      evidenceLinks: [],
      aiBio: "",
      rawResults: [],
    };
  }

  override onResize(shape: IntelNodeShape, info: TLResizeInfo<IntelNodeShape>) {
    return resizeBox(shape, info);
  }

  component(shape: IntelNodeShape) {
    return (
      <HTMLContainer
        style={{
          width: shape.props.w,
          height: shape.props.h,
          pointerEvents: "all",
        }}
      >
        <IntelNodeComponent shape={shape} />
      </HTMLContainer>
    );
  }

  indicator(shape: IntelNodeShape) {
    return (
      <rect
        width={shape.props.w}
        height={shape.props.h}
        rx={20}
        ry={20}
        fill="none"
        stroke="hsl(166, 72%, 47%)"
        strokeWidth={1.5}
        strokeOpacity={0.5}
      />
    );
  }
}
