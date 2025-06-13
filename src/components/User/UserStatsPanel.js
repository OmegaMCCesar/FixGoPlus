import React from 'react';
import { ReactComponent as TuerquitaCurrencyIcon } from '../../assets/icons/tuerquita-llenaa.svg';
import { ReactComponent as VidaIcon } from '../../assets/icons/tuerquita-llena.svg';

const UserStatsPanel = ({ user }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-8 p-4 bg-neutral-light rounded-xl border border-neutral-medium">
      <div className="flex items-center">
        <VidaIcon className="h-7 w-7 mr-2 fill-accent-red" />
        <span className="text-2xl font-bold text-accent-red">{user?.lives ?? '0'}</span>
        <span className="ml-1.5 text-sm text-text-secondary self-end leading-none pb-0.5">Vidas</span>
      </div>
      <div className="flex items-center">
        <TuerquitaCurrencyIcon className="h-7 w-7 mr-2 fill-accent-orange" />
        <span className="text-2xl font-bold text-accent-orange">{user?.tuerquitas ?? '0'}</span>
        <span className="ml-1.5 text-sm text-text-secondary self-end leading-none pb-0.5">Tuerquitas</span>
      </div>
    </div>
  );
};

export default UserStatsPanel;
