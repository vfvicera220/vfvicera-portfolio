import React from "react";
import Image, { StaticImageData } from "next/image";

interface LogoSize {
  width: number | string;
  height: number | string;
}

interface SkillItemProps {
  logo: StaticImageData;
  title: string;
  logoSize: LogoSize;
  onClick?: () => void;
}

const SkillItem: React.FC<SkillItemProps> = ({
  logo,
  title,
  logoSize,
  onClick,
}) => {
  const { width, height } = logoSize;
  return (
    <div className="rounded p-5 hover:bg-blue-50" onClick={onClick}>
      <div className="flex justify-center">
        <Image
          style={{ height: height, width: width }}
          className="self-center"
          src={logo}
          alt=""
        />
      </div>
      <div className="flex justify-center pt-3">
        <label className="text-center pt-1 text-xl font-bold leading-8 text-gray-600">
          {title}
        </label>
      </div>
    </div>
  );
};

export default SkillItem;
