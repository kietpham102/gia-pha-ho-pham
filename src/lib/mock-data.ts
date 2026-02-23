/**
 * Mock data for demo mode — used when Supabase is not configured
 * Dòng họ mẫu: Họ Phạm — 4 thế hệ, 15 thành viên
 * Quy tắc đặt tên:
 *   Đời 1: Phạm + Tên (không tên đệm)
 *   Đời 2: Phạm Đình + Tên
 *   Đời 3: Phạm Ngọc/Quốc/Anh + Tên (theo chi)
 *   Đời 4: Phạm + Họ mẹ + Tên
 */
import type { TreeNode, TreeFamily } from './tree-layout';

export const MOCK_PEOPLE: TreeNode[] = [
    // Đời 1: chỉ Họ + Tên
    { handle: 'P001', displayName: 'Phạm Thịnh', gender: 1, generation: 1, birthYear: 1920, deathYear: 1995, isLiving: false, isPrivacyFiltered: false, isPatrilineal: true, families: ['F001'], parentFamilies: [] },
    // Đời 2: Phạm Đình + Tên
    { handle: 'P002', displayName: 'Phạm Đình Bình', gender: 1, generation: 2, birthYear: 1945, isLiving: true, isPrivacyFiltered: false, isPatrilineal: true, families: ['F002'], parentFamilies: ['F001'] },
    { handle: 'P003', displayName: 'Phạm Đình Cường', gender: 1, generation: 2, birthYear: 1948, isLiving: true, isPrivacyFiltered: false, isPatrilineal: true, families: ['F003'], parentFamilies: ['F001'] },
    { handle: 'P004', displayName: 'Phạm Đình Dũng', gender: 1, generation: 2, birthYear: 1951, deathYear: 2020, isLiving: false, isPrivacyFiltered: false, isPatrilineal: true, families: ['F004'], parentFamilies: ['F001'] },
    // Đời 3: tên đệm theo chi (Ngọc/Quốc/Anh)
    { handle: 'P005', displayName: 'Phạm Ngọc Hải', gender: 1, generation: 3, birthYear: 1970, isLiving: true, isPrivacyFiltered: false, isPatrilineal: true, families: ['F005'], parentFamilies: ['F002'] },
    { handle: 'P006', displayName: 'Phạm Ngọc Hùng', gender: 1, generation: 3, birthYear: 1973, isLiving: true, isPrivacyFiltered: false, isPatrilineal: true, families: [], parentFamilies: ['F002'] },
    { handle: 'P007', displayName: 'Phạm Quốc Khoa', gender: 1, generation: 3, birthYear: 1975, isLiving: true, isPrivacyFiltered: false, isPatrilineal: true, families: ['F006'], parentFamilies: ['F003'] },
    { handle: 'P008', displayName: 'Phạm Quốc Khánh', gender: 1, generation: 3, birthYear: 1978, isLiving: true, isPrivacyFiltered: false, isPatrilineal: true, families: [], parentFamilies: ['F003'] },
    { handle: 'P009', displayName: 'Phạm Anh Long', gender: 1, generation: 3, birthYear: 1980, isLiving: true, isPrivacyFiltered: false, isPatrilineal: true, families: [], parentFamilies: ['F004'] },
    // Đời 4: Phạm + Họ mẹ + Tên (mẹ Trần Thị Hoa → đệm "Trần")
    { handle: 'P010', displayName: 'Phạm Trần Minh', gender: 1, generation: 4, birthYear: 1995, isLiving: true, isPrivacyFiltered: false, isPatrilineal: true, families: [], parentFamilies: ['F005'] },
    { handle: 'P011', displayName: 'Phạm Trần Nam', gender: 1, generation: 4, birthYear: 1998, isLiving: true, isPrivacyFiltered: false, isPatrilineal: true, families: [], parentFamilies: ['F005'] },
    { handle: 'P012', displayName: 'Phạm Quốc Phúc', gender: 1, generation: 4, birthYear: 2000, isLiving: true, isPrivacyFiltered: false, isPatrilineal: true, families: [], parentFamilies: ['F006'] },
    // Vợ (ngoại tộc)
    { handle: 'P013', displayName: 'Nguyễn Thị Dung', gender: 2, generation: 1, birthYear: 1925, deathYear: 2000, isLiving: false, isPrivacyFiltered: false, isPatrilineal: false, families: [], parentFamilies: [] },
    { handle: 'P014', displayName: 'Lê Thị Mai', gender: 2, generation: 2, birthYear: 1948, isLiving: true, isPrivacyFiltered: false, isPatrilineal: false, families: [], parentFamilies: [] },
    { handle: 'P015', displayName: 'Trần Thị Hoa', gender: 2, generation: 3, birthYear: 1972, isLiving: true, isPrivacyFiltered: false, isPatrilineal: false, families: [], parentFamilies: [] },
];

export const MOCK_FAMILIES: TreeFamily[] = [
    { handle: 'F001', fatherHandle: 'P001', motherHandle: 'P013', children: ['P002', 'P003', 'P004'] },
    { handle: 'F002', fatherHandle: 'P002', motherHandle: 'P014', children: ['P005', 'P006'] },
    { handle: 'F003', fatherHandle: 'P003', children: ['P007', 'P008'] },
    { handle: 'F004', fatherHandle: 'P004', children: ['P009'] },
    { handle: 'F005', fatherHandle: 'P005', motherHandle: 'P015', children: ['P010', 'P011'] },
    { handle: 'F006', fatherHandle: 'P007', children: ['P012'] },
];

export function getMockTreeData() {
    return { people: MOCK_PEOPLE, families: MOCK_FAMILIES };
}
