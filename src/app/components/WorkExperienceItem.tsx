import React from 'react';
import Image, { StaticImageData } from "next/image";
import { PlayIcon } from "@heroicons/react/24/solid";

interface WorkExperienceItemProps {
    title: string;
    yearSpan: string;
    bulletPoints?: Array<string>;
    description: string;
    logo: StaticImageData;
}

const WorkExperienceItem: React.FC<WorkExperienceItemProps> = ({title, bulletPoints, yearSpan, description, logo}) => {
    return (
      <div className="flex-1 my-14 justify-center">
        <div className='flex justify-between'>
            <div className='flex align-middle'>
                <Image className='self-center h-11 w-auto pr-5' src={logo} alt=''/>
                <div>
                  <h4 className='pt-1 text-xl font-bold leading-8 text-gray-600'>{title}</h4>
                  <h4 className='text-md font-medium leading-8 text-gray-600'>{yearSpan}</h4>
                </div>
            </div>
        </div>
        <div>
          <p className="text-md text-gray-600 pl-2 font-normal">{description}</p>
        </div>
        <div className={`${bulletPoints ? 'pt-5' : 'hidden'}`}>
            {
                bulletPoints?.map((item) => {
                    return (
                      <div className="flex py-1" key={item}>
                        <div>
                          <PlayIcon
                            aria-hidden="true"
                            color="black"
                            className="h-4 w-4"
                          />
                        </div>
                        <p className="text-md text-gray-600 pl-2 font-normal">
                          {item}
                        </p>
                      </div>
                    );
                })
            }
        </div>
      </div>
    );
};

export default WorkExperienceItem;
