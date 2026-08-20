import { Button } from "@langyspace/ui";
import { styled } from "styled-components";

export const RangeButton = styled(Button)`
  min-width: 3rem;
  color: rgba(255, 255, 255, 0.72);
  background-color: transparent;

  &[aria-pressed="true"] {
    color: #050505;
    background-color: #ffffff;
  }
`;
