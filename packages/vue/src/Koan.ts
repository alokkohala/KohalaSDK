import { defineComponent, h, type PropType } from "vue";
import { useKohala } from "./composables";

/** Renders a Kohala Koan visualization in a responsive iframe. */
export const Koan = defineComponent({
  name: "KohalaKoan",
  props: {
    slug: { type: String, required: true },
    view: {
      type: String as PropType<"detail" | "card">,
      default: undefined,
    },
  },
  setup(props) {
    const k = useKohala();
    return () =>
      h("iframe", {
        src: k.koans.embedUrl(props.slug, props.view ? { view: props.view } : {}),
        title: `Kohala Koan: ${props.slug}`,
        style: "border:none;width:100%;",
      });
  },
});
