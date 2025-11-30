import { Eye } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

function Player({ player, index }) {
    const navigate = useNavigate();

    return (
        <tbody className="text-center divide-gray-300 border">
            <tr
                key={player._id}
                className="bg-white transition-all duration-500 hover:bg-gray-50"
            >
                <td className="p-2 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                    #{index}
                </td>
                <td onClick={() => navigate(`/player/details/${player._id}`)} className="p-2 whitespace-nowrap cursor-pointer text-indigo-500 text-sm leading-6 font-medium ">
                    {player.name}
                </td>
                <td className="p-2 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                    {player.phone_no}
                </td>
                <td className="p-2 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                    {player.referral_code}
                </td>
                <td className="p-2 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                    {player.referred_by ?? "N/A"}
                </td>
                {/* <td className="p-2 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                    {player.bonus_amount}
                </td> */}
                <td className="p-2 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                    {player.wallet_balance + player.win_amount + player.bonus_amount}
                </td>
                <td className="p-2 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                    {new Date(player.createdAt).toLocaleString()}
                </td>
                <td className="p-2 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                    <p
                        className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${
                            player.block
                                ? 'bg-red-600 text-red-600'
                                : 'bg-green-600 text-green-600'
                        }`}
                    >
                        {player.block ? "Block" : "Active"}
                    </p>
                </td>
                <td className="p-2 whitespace-nowrap text-sm leading-6 font-medium text-gray-900">
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate(`/player/details/${player._id}`)}
                            className="hover:text-primary bg-blue-600 py-2 px-4 rounded-xl"
                        >
                            <Eye color="white" size={20} />
                        </button>
                    </div>
                </td>
            </tr>
        </tbody>
    );
}

export default Player;
